# -*- coding: utf-8 -*-
"""把单词表照片切成便于 OCR 的小图。

手机拍的课本照片有 3000~4000 px 宽，整张直接读会看不清声调圆圈（⓪ 和 ① 极易混淆）。
标准做法是两步：
  1. --preview：整张缩放到 1200~1400 px 读一遍，只看版面结构（有几张表、表头在哪）
  2. --box + --bands：按第 1 步定位到的表格区域，在原图上满分辨率裁剪后横向切条，逐条精读

用法：
    python codes/slice_for_ocr.py 图片.jpg --preview 1300 --out .tmp_ocr
    python codes/slice_for_ocr.py 图片.jpg --box 200,900,2900,3650 --bands 3 --out .tmp_ocr
"""
import argparse
import os

from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--out", required=True, help="输出目录")
    ap.add_argument("--preview", type=int, help="整图缩放到该宽度")
    ap.add_argument("--box", help="裁剪区域 x0,y0,x1,y1（原图坐标）")
    ap.add_argument("--bands", type=int, default=1, help="把裁剪区域横向切成几条")
    ap.add_argument("--tag", default="", help="输出文件名前缀，同一张图裁多个区域时用来区分，避免互相覆盖")
    ap.add_argument("--quality", type=int, default=92)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    stem = os.path.splitext(os.path.basename(args.image))[0]
    # 同一张图常常要裁好几次（整表、左列、右列），不加 tag 会互相覆盖
    if args.tag:
        stem = f"{args.tag}_{stem}"
    im = Image.open(args.image)

    if args.preview:
        p = im.copy()
        p.thumbnail((args.preview, args.preview * 2))
        path = os.path.join(args.out, f"{stem}_preview.jpg")
        p.save(path, quality=85)
        print(f"{path}  {p.size}")

    if args.box:
        x0, y0, x1, y1 = (int(v) for v in args.box.split(","))
        crop = im.crop((x0, y0, x1, y1))
        w, h = crop.size
        for i in range(args.bands):
            band = crop.crop((0, h * i // args.bands, w, h * (i + 1) // args.bands))
            path = os.path.join(args.out, f"{stem}_band{i}.jpg")
            band.save(path, quality=args.quality)
            print(f"{path}  {band.size}")


if __name__ == "__main__":
    main()

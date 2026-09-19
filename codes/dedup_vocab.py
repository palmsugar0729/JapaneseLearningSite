# -*- coding: utf-8 -*-
"""跨单元去重：单词和读音都相同的词条只保留一份。

判定键 = (日语, 读音)。纯假名词的读音在导出时由脚本回填成词本身，这里的比较同样按
「读音为空则取日语」处理，保证和 Excel 里看到的一致。

保留策略：**保留单元号小的那个**（UNIT 1 优先于 UNIT 5），单元内重复保留首次出现。
只改 codes/vocab_data/*.json；改完自己跑一遍 build_vocab_excel.py 重生成 xlsx。

用法：
    python codes/dedup_vocab.py --dry-run   # 只看会删哪些，不落盘
    python codes/dedup_vocab.py             # 实际删除
"""
import argparse
import collections
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "codes", "vocab_data")


def unit_sort_key(unit: str) -> int:
    return int(unit.split()[1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="只报告，不修改文件")
    args = ap.parse_args()

    units = sorted(
        (f[:-5] for f in os.listdir(DATA_DIR) if f.endswith(".json")),
        key=unit_sort_key,
    )

    seen = {}          # (word, reading) -> (unit, 行号)
    removed = collections.defaultdict(list)
    result = {}

    for unit in units:
        rows = json.load(open(os.path.join(DATA_DIR, f"{unit}.json"), encoding="utf-8"))
        kept = []
        for i, row in enumerate(rows, 1):
            word, reading = row[0], row[1] or row[0]
            key = (word, reading)
            if key in seen:
                kept_unit, kept_line = seen[key]
                removed[unit].append((i, row, kept_unit, kept_line))
            else:
                seen[key] = (unit, i)
                kept.append(row)
        result[unit] = kept

    total_removed = sum(len(v) for v in removed.values())
    print(f"共 {len(units)} 个单元，删除 {total_removed} 条重复")
    for unit in units:
        for line_no, row, kept_unit, kept_line in removed[unit]:
            print(f"  删 [{unit}] 第{line_no}行  {row[0]} / {row[1] or row[0]}"
                  f"   （保留 [{kept_unit}] 第{kept_line}行）")

    if args.dry_run:
        print("\n--dry-run：未写入文件")
        return

    for unit in units:
        path = os.path.join(DATA_DIR, f"{unit}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(result[unit], f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  {unit}.json  {len(result[unit])} 条")


if __name__ == "__main__":
    main()

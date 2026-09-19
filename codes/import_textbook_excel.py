# -*- coding: utf-8 -*-
"""把整理好的教科书单词表 Excel 导成应用词库 JSON。

上游是 `build_vocab_excel.py`（OCR 词表 → Excel），人工在 Excel 里校对增删之后，
用本脚本导入前端词库。两者衔接的文件就是 `docs/vocabulary_files/LEVEL N/UNIT M.xlsx`。

Excel 格式（第 1 行表头，列顺序固定）：
    日语 | 读音 | 声调 | 词性 | 中文意思

输出：codes/web/src/content/japanese/textbook/level-<N>/unit-<MM>.json

用法：
    python codes/import_textbook_excel.py 1                       # LEVEL 1，默认取 docs/vocabulary_files/LEVEL 1
    python codes/import_textbook_excel.py 2 --textbook "LEVEL 2"  # 指定教材展示名
    python codes/import_textbook_excel.py 1 --dry-run             # 只校验不写文件

注意：
- 词性的外层方括号会被剥掉（`[名・他動3]` → `名・他動3`），与 JLPT 词库写法一致
- 单词 ID 为 `tb{级别}-{单元}-{序号}`，**改这个格式会让已有学习进度错位**，见 AGENTS.md 3.4
- 缺失的字段一律留空字符串，不编造（旧数据同样没有例句）
"""
import argparse
import json
import os
import re
import sys

from openpyxl import load_workbook

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_BASE = os.path.join(ROOT, "codes", "web", "src", "content", "japanese", "textbook")

HEADERS = ["日语", "读音", "声调", "词性", "中文意思"]
# 形如 "UNIT 1.xlsx" / "unit-1.xlsx"，单元号取其中第一段数字
UNIT_RE = re.compile(r"(\d+)")


def parse_unit_no(filename: str) -> int | None:
    """从文件名里取单元号，取不到返回 None。"""
    m = UNIT_RE.search(os.path.splitext(filename)[0])
    return int(m.group(1)) if m else None


def cell(value) -> str:
    """单元格转字符串，None / 空白一律成空串。"""
    if value is None:
        return ""
    return str(value).strip()


def strip_brackets(text: str) -> str:
    """剥掉词性外面的方括号：`[名]` → `名`。"""
    m = re.match(r"^\[(.*)\]$", text)
    return m.group(1).strip() if m else text


def load_unit(path: str, unit_no: int, level: int, textbook: str, jlpt_level: str):
    """读一个单元的 Excel，返回 (词条列表, 警告列表)。"""
    ws = load_workbook(path, data_only=True).worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]

    # 表头行按内容识别，不写死行号，容忍有人在上面加标题行
    if rows and [cell(c) for c in rows[0][:5]] == HEADERS:
        rows = rows[1:]

    items, warnings = [], []
    for idx, raw in enumerate(rows, 1):
        if not any(cell(c) for c in raw):
            continue
        cells = (list(raw) + [None] * 5)[:5]
        word, reading, accent, word_type, meaning = (cell(c) for c in cells)

        if not word:
            warnings.append(f"第 {idx} 行：日语为空，已跳过")
            continue

        word_type = strip_brackets(word_type)
        if not word_type:
            warnings.append(f"第 {idx} 行「{word}」：词性为空（留空处理）")
        if not reading:
            warnings.append(f"第 {idx} 行「{word}」：读音为空")

        items.append(
            {
                "id": f"tb{level}-{unit_no:02d}-{len(items) + 1:03d}",
                "word": word,
                "reading": reading,
                "meaning": meaning,
                "type": word_type,
                "accent": accent,
                "level": jlpt_level,
                "example": "",
                "exampleTranslation": "",
                "source": "textbook",
                "textbook": textbook,
                "textbookLevel": level,
                "unit": unit_no,
            }
        )
    return items, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="教科书单词表 Excel → 应用词库 JSON")
    parser.add_argument("level", type=int, help="教材级别，如 1 表示 LEVEL 1（输出 tb1-* 的 ID）")
    parser.add_argument("--src", help="Excel 所在目录，默认 docs/vocabulary_files/LEVEL <level>")
    parser.add_argument("--textbook", help="教材展示名，默认 LEVEL <level>")
    parser.add_argument(
        "--jlpt-level",
        default="N5",
        choices=["N5", "N4", "N3", "N2", "N1"],
        help="条目的 JLPT 难度参考值，默认 N5（仅作难度参考，不参与 JLPT 级别统计）",
    )
    parser.add_argument("--dry-run", action="store_true", help="只校验并打印，不写文件")
    args = parser.parse_args()

    src_dir = args.src or os.path.join(ROOT, "docs", "vocabulary_files", f"LEVEL {args.level}")
    textbook = args.textbook or f"LEVEL {args.level}"

    if not os.path.isdir(src_dir):
        print(f"[错误] Excel 目录不存在：{src_dir}", file=sys.stderr)
        return 1

    files = [f for f in os.listdir(src_dir) if f.lower().endswith(".xlsx") and not f.startswith("~$")]
    if not files:
        print(f"[错误] {src_dir} 里没有 .xlsx 文件", file=sys.stderr)
        return 1

    units = []
    for fname in files:
        unit_no = parse_unit_no(fname)
        if unit_no is None:
            print(f"[跳过] 文件名里找不到单元号：{fname}", file=sys.stderr)
            continue
        units.append((unit_no, fname))
    units.sort()

    out_dir = os.path.join(OUT_BASE, f"level-{args.level}")
    total, warn_count = 0, 0

    for unit_no, fname in units:
        items, warnings = load_unit(
            os.path.join(src_dir, fname), unit_no, args.level, textbook, args.jlpt_level
        )
        total += len(items)
        warn_count += len(warnings)
        print(f"UNIT {unit_no:>2}  {len(items):>3} 词  {'(dry-run)' if args.dry_run else '→ ' + os.path.relpath(os.path.join(out_dir, f'unit-{unit_no:02d}.json'), ROOT)}")
        for w in warnings:
            print(f"         ⚠ {w}")

        if not args.dry_run:
            os.makedirs(out_dir, exist_ok=True)
            with open(os.path.join(out_dir, f"unit-{unit_no:02d}.json"), "w", encoding="utf-8", newline="\n") as f:
                json.dump(items, f, ensure_ascii=False, indent=2)
                f.write("\n")

    print(f"\n合计 {len(units)} 个单元 / {total} 词，{warn_count} 条提醒")
    if not args.dry_run:
        print(f"输出目录：{os.path.relpath(out_dir, ROOT)}")
        print("⚠ 改动了词条内容或 ID 会让已有学习进度错位，必要时按 AGENTS.md 3.4 做迁移")
    return 0


if __name__ == "__main__":
    sys.exit(main())

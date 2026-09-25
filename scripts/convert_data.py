# -*- coding: utf-8 -*-
"""
将 GBK 编码的原始数据转为 UTF-8 的 ES 模块：
  用户.txt  -> src/data/users.js    （200 个昵称，1-50 古风 / 51-100 随机 / 101-200 校园梗）
  祝福.txt  -> src/data/blessings.js（200 条祝福，格式：（N，祝福语））

用法：python scripts/convert_data.py   （或 npm run convert）
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding="utf-8")

NICK_RE = re.compile(r"^\s*\d+\s*[，,、．.]\s*(.+)$")
BLESS_RE = re.compile(r"^\s*[（(]\s*\d+\s*[，,]\s*(.+?)\s*[）)]\s*$")


def read_lines(name: str) -> list[str]:
    text = (ROOT / name).read_text(encoding="gbk")
    return [l for l in (line.strip() for line in text.splitlines()) if l]


def parse_users() -> list[str]:
    users = []
    for i, line in enumerate(read_lines("用户.txt"), 1):
        m = NICK_RE.match(line)
        if not m:
            raise ValueError(f"用户.txt 第 {i} 行格式不符（期望 'N，昵称'）: {line!r}")
        users.append(m.group(1).strip())
    return users


def parse_blessings() -> list[str]:
    blessings = []
    for i, line in enumerate(read_lines("祝福.txt"), 1):
        m = BLESS_RE.match(line)
        if not m:
            raise ValueError(f"祝福.txt 第 {i} 行格式不符（期望 '（N，祝福语）'）: {line!r}")
        blessings.append(m.group(1).strip())
    return blessings


def dump_js(obj, header: str) -> str:
    body = json.dumps(obj, ensure_ascii=False, indent=0)
    # json.dumps 的数组是逐项一行，便于 diff
    return f"// {header}\n// 本文件由 scripts/convert_data.py 自动生成，请勿手改。\nexport const data = {body}\n"


def main() -> None:
    users = parse_users()
    blessings = parse_blessings()
    assert len(users) == 200, f"昵称数量异常: {len(users)}"
    assert len(blessings) == 200, f"祝福数量异常: {len(blessings)}"

    out_dir = ROOT / "src" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    groups = [
        {"id": "gufeng", "label": "古风雅韵", "from": 1, "to": 50},
        {"id": "random", "label": "随心而名", "from": 51, "to": 100},
        {"id": "campus", "label": "校园整活", "from": 101, "to": 200},
    ]

    users_js = (
        "// 昵称数据：源自 用户.txt（GBK -> UTF-8），共 200 条。\n"
        "// 分组：1-50 古风雅韵 / 51-100 随心而名 / 101-200 校园整活（1 基）。\n"
        "// 本文件由 scripts/convert_data.py 自动生成，请勿手改。\n"
        f"export const userGroups = {json.dumps(groups, ensure_ascii=False, indent=2)}\n\n"
        f"export const users = {json.dumps(users, ensure_ascii=False, indent=0)}\n"
    )
    (out_dir / "users.js").write_text(users_js, encoding="utf-8")

    blessings_js = (
        "// 祝福数据：源自 祝福.txt（GBK -> UTF-8），共 200 条，顺序与原文一致（下标 0 对应编号 1）。\n"
        "// 本文件由 scripts/convert_data.py 自动生成，请勿手改。\n"
        f"export const blessings = {json.dumps(blessings, ensure_ascii=False, indent=0)}\n"
    )
    (out_dir / "blessings.js").write_text(blessings_js, encoding="utf-8")

    print(f"OK users={len(users)} blessings={len(blessings)}")
    print(f"  -> {out_dir / 'users.js'}")
    print(f"  -> {out_dir / 'blessings.js'}")


if __name__ == "__main__":
    main()

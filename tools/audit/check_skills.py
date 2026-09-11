#!/usr/bin/env python3
"""校验 .agents/skills/*/SKILL.md 的 frontmatter 是否合法。

纯标准库实现（本机 python3 与 .venv 都没有 PyYAML）。
覆盖 opencode 与 DSH 两边的注册条件，重点抓 M52：
description 是未加引号的 plain scalar 且含 ": " → 严格解析器判非法 → 整个 Skill 被静默丢弃。

用法：
    python3 tools/audit/check_skills.py
退出码 0 = 全部通过，1 = 有 Skill 会被丢弃。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SKILLS_ROOT = Path(__file__).resolve().parents[2] / ".agents" / "skills"
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

# 未加引号的 plain scalar 里，这些字符会破坏 YAML 解析
BREAKING = [": ", " #", "{", "}", "[", "]", "&", "*", "! ", "|", ">", "%", "@", "`"]


def parse_frontmatter(text: str) -> tuple[dict[str, str], list[str]]:
    """返回 (键值对, 错误列表)。不做完整 YAML，只做本目录需要的严格子集。"""
    errors: list[str] = []
    if not text.startswith("---"):
        return {}, ["缺少 frontmatter（文件未以 '---' 开头）"]

    end = text.find("\n---", 3)
    if end == -1:
        return {}, ["frontmatter 未闭合（找不到结束的 '---'）"]

    fields: dict[str, str] = {}
    for lineno, raw in enumerate(text[3:end].splitlines(), start=2):
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            errors.append(f"第 {lineno} 行不是 key: value 形式：{line!r}")
            continue
        if line[0] in " \t":
            errors.append(f"第 {lineno} 行是缩进续行（本目录不支持多行值）：{line!r}")
            continue

        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()

        if value[:1] in ('"', "'"):
            quote = value[0]
            if len(value) < 2 or not value.endswith(quote):
                errors.append(f"第 {lineno} 行 {key} 引号未闭合")
                continue
            value = value[1:-1]
        else:
            for token in BREAKING:
                if token in value:
                    errors.append(
                        f"第 {lineno} 行 {key} 是未加引号的 plain scalar，却含 {token!r}；"
                        f"严格 YAML 会解析失败 → 该 Skill 会被静默丢弃（见 METHODS.md M52）"
                    )
                    break
        fields[key] = value

    return fields, errors


def main() -> int:
    if not SKILLS_ROOT.is_dir():
        print(f"找不到 Skill 目录：{SKILLS_ROOT}")
        return 1

    skill_files = sorted(SKILLS_ROOT.glob("*/SKILL.md"))
    if not skill_files:
        print(f"{SKILLS_ROOT} 下没有 */SKILL.md")
        return 1

    failures = 0
    print(f"检查 {len(skill_files)} 个 Skill：{SKILLS_ROOT}\n")

    for path in skill_files:
        dirname = path.parent.name
        fields, errors = parse_frontmatter(path.read_text(encoding="utf-8"))

        name = fields.get("name", "")
        desc = fields.get("description", "")

        if not name:
            errors.append("缺少必填字段 name")
        elif name != dirname:
            errors.append(f"name ({name!r}) 与目录名 ({dirname!r}) 不一致")
        elif not NAME_RE.match(name):
            errors.append(f"name {name!r} 不符合 ^[a-z0-9]+(-[a-z0-9]+)*$")
        elif len(name) > 64:
            errors.append(f"name 超长（{len(name)} > 64）")

        if not desc:
            errors.append("缺少必填字段 description")
        elif len(desc) > 1024:
            errors.append(f"description 超长（{len(desc)} > 1024，opencode 上限）")
        elif len(desc) > 500:
            errors.append(
                f"description {len(desc)} 字符 > 500，DSH 会话目录里会被截断（仍可加载）"
            )

        if errors:
            failures += 1
            print(f"[FAIL] {dirname}")
            for err in errors:
                print(f"       - {err}")
        else:
            print(f"[ OK ] {dirname:14} name={name} desc={len(desc)} 字符")

    print()
    if failures:
        print(f"未通过：{failures}/{len(skill_files)} 个 Skill 会被至少一个运行环境丢弃。")
        return 1

    print(f"全部通过：{len(skill_files)}/{len(skill_files)}。")
    return 0


if __name__ == "__main__":
    sys.exit(main())

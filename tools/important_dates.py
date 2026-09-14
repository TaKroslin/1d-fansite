#!/usr/bin/env python3
"""One Direction 重要日期倒计时。

数据与 docs/1d-important-dates.md 的表格一致（只收能确认到具体日期的条目）；
改了日期两边都要更新。

用法:
    python3 tools/important_dates.py              # 全部，按"离今天多近"排序
    python3 tools/important_dates.py --birthdays  # 只看五个成员生日
    python3 tools/important_dates.py --days 120   # 只看 120 天内到期的
    python3 tools/important_dates.py --today 2026-09-13   # 按指定日期算，便于核对
"""

import argparse
from datetime import date

# (月, 日, 起始年, 名称, 是否成员生日)
DATES = [
    (12, 24, 1991, "Louis Tomlinson 生日", True),
    (1, 12, 1993, "Zayn Malik 生日", True),
    (2, 1, 1994, "Harry Styles 生日", True),
    (8, 29, 1993, "Liam Payne 生日（2024 年离世，按纪念日处理）", True),
    (9, 13, 1993, "Niall Horan 生日", True),
    (7, 23, 2010, "成团日（X Factor 训练营组队）", False),
    (12, 12, 2010, "X Factor 第 7 季决赛（第三名）", False),
    (11, 18, 2011, "首张专辑 Up All Night 发行", False),
    (11, 9, 2012, "专辑 Take Me Home 发行", False),
    (8, 20, 2013, "纪录片电影 This Is Us 伦敦全球首映", False),
    (11, 25, 2013, "专辑 Midnight Memories 发行", False),
    (11, 17, 2014, "专辑 FOUR 发行", False),
    (3, 25, 2015, "Zayn Malik 宣布离团", False),
    (8, 25, 2015, "官方宣布 2016 年暂停活动", False),
    (11, 13, 2015, "专辑 Made in the A.M. 发行（休团前最后一张）", False),
    (7, 23, 2020, "成团十周年（官方发布纪念视频）", False),
    (10, 16, 2024, "Liam Payne 离世", False),
]

WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]


def next_occurrence(month, day, today):
    """返回今天或之后的下一次该日期。"""
    for year in (today.year, today.year + 1):
        try:
            candidate = date(year, month, day)
        except ValueError:  # 2 月 29 日之类
            continue
        if candidate >= today:
            return candidate
    return None


def collect(today):
    rows = []
    for month, day, since, label, is_birthday in DATES:
        when = next_occurrence(month, day, today)
        if when is None:
            continue
        rows.append({
            "date": when,
            "label": label,
            "since": since,
            "is_birthday": is_birthday,
            "days": (when - today).days,
        })
    rows.sort(key=lambda r: r["days"])
    return rows


def main():
    parser = argparse.ArgumentParser(description="One Direction 重要日期倒计时")
    parser.add_argument("--birthdays", action="store_true", help="只看五个成员生日")
    parser.add_argument("--days", type=int, default=None, help="只看 N 天内到期的")
    parser.add_argument("--today", default=None, help="按指定日期计算（YYYY-MM-DD）")
    args = parser.parse_args()

    today = date.fromisoformat(args.today) if args.today else date.today()
    rows = collect(today)
    if args.birthdays:
        rows = [r for r in rows if r["is_birthday"]]
    if args.days is not None:
        rows = [r for r in rows if r["days"] <= args.days]

    print(f"今天 {today.isoformat()}（{WEEKDAYS[today.weekday()]}）")
    print("-" * 70)
    if not rows:
        print("（这个范围内没有条目）")
        return
    for r in rows:
        d = r["date"]
        when = "今天！" if r["days"] == 0 else f"{r['days']} 天后"
        mark = "★" if r["is_birthday"] else " "
        print(f"{mark} {d.isoformat()} {WEEKDAYS[d.weekday()]}  {when:>9}  {r['label']}")
    print("-" * 70)
    print("★ = 成员生日（详见 docs/1d-important-dates.md）")


if __name__ == "__main__":
    main()

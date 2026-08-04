# QA 验证参考（qa-workflow / reference）

## 1. 各场景默认验证矩阵

| 场景 | 默认验证 | 是否要视觉 |
|------|---------|-----------|
| 改文本/链接/路径 | 第 1+2 层 | 否 |
| 加图片 | 第 2 层（审计 0 断链） | 否 |
| 改 CSS 布局/颜色 | 第 1+2 层 + 第 3 层截图确认 | 是 |
| 改 JS 交互 | 第 3 层（点击/键盘/滑动断言） | 必要时截图 |
| 改 blog/重建页面 | 第 1+2 层 | 否 |
| 批量重建页面 | 脚本幂等检查 + 第 2 层全量审计 | 抽查 1-2 张截图 |

## 2. 三层检测

| 层 | 工具 | 成本 | 用途 |
|----|------|------|------|
| 1 静态 | grep / 读文件 | 秒级 | 语法、残留引用、路径深度 |
| 2 HTTP | server + urllib/requests | 分钟级 | 图片/资源/页面 200 |
| 3 浏览器 | Playwright | 贵 | 视觉/交互确认 |

## 3. 常用 grep 命令

```bash
# 残留引用（页面级不应有 onedirectionmusiccom-ukprod 真实引用）
rg "onedirectionmusiccom-ukprod" pages/ --glob "*.html"
# 注：meta og:image 的 cdn.smehost.net 外链可留，不渲染

# 找重复 script 引用（事件双绑隐患，M14）
rg "slideshow-nav.js" pages/music/albums/ --glob "*.html"

# 找双扩展名残留
rg "\.jpg\.jpg" pages/

# 找 sml 残留（页面层应为 0）
rg "gallery-images/rect-sml" pages/

# 部署前：未跟踪文件 = 线上 404 隐患
git status --porcelain | grep "^??"
```

## 4. 图片审计核心逻辑（_audit_site_images.py）

- 遍历 `index.html` + `pages/**/*.html`。
- 去 HTML 注释 → 提取 `src="*.jpg|png|gif|jpeg"` + `background...url(...)`。
- 跳过 http/`//`/data: → `urljoin(BASE + rel, ref)` → HTTP 请求。
- 目标：`Total local image refs checked: N`，`Broken: 0`。

## 5. Python 脚本编写要点

```python
# -*- coding: utf-8 -*-
# 1. 读写显式 encoding='utf-8'；外部 JSON 用 utf-8-sig
# 2. 幂等：重复跑结果一致，输出统计（改了 N 个文件）
# 3. 相对路径深度用常量，不手工拼
# 4. 正则替换先打印匹配组确认，再 sub
# 5. Playwright 脚本结尾 os._exit(0)
# 6. 批量替换 marker 用裸文本，不包 HTML 注释（RULES §2.4）
# 7. 不要用 dict.get(key, default) 传需要求值的默认值（RULES §2.4）
```

## 6. 常见坑

| 编号 | 坑 |
|------|----|
| M8 | QA 图片路径用 Path.resolve 误报 → 必须 HTTP urljoin |
| M12 | CSS 改完不 bump ?v= → 用户看不到效果 |
| M14 | 同一 JS 引用两次 = 事件双绑 |
| — | Playwright 结尾不用 os._exit(0) → 命令挂起 timeout |

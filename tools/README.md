# tools/ — 工具索引（按任务分类）

> 给 agent 的工具速查：**常驻工具按功能分目录**，一次性脚本统一归档到 `archive/`。
> 所有命令在**项目根目录**执行；Python 用 `.venv/bin/python`（本机），Windows 用 `python`。

## 目录结构

```
tools/
├── README.md          ← 本索引
├── build/             ← 页面构建 / 生成器
├── translate/         ← 中英翻译注入
├── audit/             ← 全站审计
├── templates/         ← blog 模板（article.html / blog_list.html，build_blog 读取）
├── _qa_screenshots/   ← 截图归档（按任务建子文件夹，见 RULES §3）
└── archive/           ← 一次性脚本 + 历史杂物（150+ 个 _ 前缀脚本/探针/日志/json）
```

## 常驻工具（推荐调用）

### build/ — 构建
| 命令 | 用途 | 幂等 |
|------|------|------|
| `.venv/bin/python tools/build/build_blog.py` | blog 构建（改 article.md 后跑）→ 文章页 + blog.html + posts.json | ✅ 重跑覆盖 |
| `.venv/bin/python tools/build/_build_albums_page.py` | 生成 `pages/gallery/albums.html`（5 专辑 × 13 photosets 集合页） | ✅ |

### translate/ — 翻译注入
| 命令 | 用途 | 幂等 |
|------|------|------|
| `.venv/bin/python tools/translate/translate_lyrics.py` | 从 `lyric_translations.py` 字典注入全部歌词页双语 | ✅ 重跑 skipped |
| `.venv/bin/python tools/translate/translate_albums.py` | 专辑页歌名双语注入（字典在脚本顶部 TRANSLATIONS） | ✅ skipped (already done) |
| `.venv/bin/python tools/translate/translate_tour.py` | tour.html 433 个场馆名双语（CWD 相对路径，必须在仓库根跑） | ✅ 无变化 |

### audit/ — 审计
| 命令 | 用途 | 幂等 |
|------|------|------|
| `.venv/bin/python tools/audit/_audit_site_images.py` | 全站图片审计（需本地 server），目标 `Broken: 0` | ✅ |

## 一次性脚本（archive/）

- 150+ 个 `_` 前缀脚本 + 探针 HTML + 抓取日志/json + `review/` 翻译复核记录 + `CODEX_TASK_*.md` 任务书 + 根目录遗留一次性脚本（`_fix_*.py`、`_http_audit.py` 等）。
- **约定**（见 RULES §2.4）：一次性任务脚本以 `_` 前缀命名，**完成后移入 `tools/archive/`**，不长期占用根目录；确无用时删除。
- 根目录不再允许新增散落脚本——新的一次性脚本直接写 `tools/archive/`，新常驻工具按类别进 `build/` / `translate/` / `audit/` 等目录。

## 历史参考

- 2026-08-05 分类归档前：根目录 200+ 文件（150 个一次性脚本 + 27 个 json/log 杂物）→ 移入 `archive/`；常驻工具按功能分目录并修正 `__file__` 相对路径（`parent.parent` → `parent.parent.parent`）。

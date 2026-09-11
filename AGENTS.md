# 1D Fansite — Agent 入口

> **FIVE GUYS ONE DIRECTION** — One Direction 粉丝社区网站。纯静态站（HTML/CSS/JS + jQuery），基于官方 onedirectionmusic.com 1:1 克隆 + fan editorial 内容。
>
> 维护者：Takion Kroslin / contact@5guys1direction.asia

## 文档地图（开工前必读）

项目文档已从单一 AGENTS.md 拆分为 `AGENTS/` 工作手册。**按任务类型加载，不要全读**：

| 文件 | 内容 | 什么时候读 |
|------|------|-----------|
| `AGENTS/AGENTS.md` | 项目全貌：Tech Stack、文件结构、路径深度表、设计系统、组件目录、Blog 工作流、页面笔记 | **所有任务**（一次读完后本会话复用） |
| `AGENTS/RULES.md` | 精细操作规范：会话启动流程、开发/检测/部署全流程、日志书写规范、效率规则 | **所有任务** |
| `AGENTS/METHODS.md` | 36 条踩坑记录（现象/根因/处理/预防），9 大分类 | 涉及图片/路径/CSS/JS/脚本/数据源时扫对应分类 |
| `AGENTS/COMMANDS.md` | 常用命令速查（server / build / 审计 / git 检查） | 需要跑命令时 |
| `AGENTS/LOG.md` | 开发日志（含书写规范） | 开工前看最近 1-3 条了解遗留；**任务完成必写新条目** |
| `README.md` | 面向投稿者的使用文档（人工维护，agent 一般不碰） | 无需 |

## 强制阅读顺序

```
1. 本文件（入口，约 30 秒）
2. AGENTS/AGENTS.md（项目是什么）+ AGENTS/RULES.md（怎么做）→ 按任务再补 METHODS.md / COMMANDS.md
```

## 核心规则（详见 RULES.md）

- **非必要不用视觉模型/截图**：能用脚本、HTTP、grep 验证的绝不启动浏览器；只有确认视觉呈现（布局/颜色/动画/响应式）时才用 Playwright 截图。
- **看图一律走 MCP `visionpower`**：DeepSeek 无原生多模态，截图/图片分析通过 `visionpower` MCP 视觉工具完成。
- **视觉验证完必发截图**：DeepSeek 无法在聊天框内嵌图片，截图验证结束后用 `open <路径>` 弹出关键截图供人工复核，不只报文字结论。
- **小步改、快验证**：每改必验证；批量操作写幂等脚本。
- **改 CSS 必须 bump `?v=`** 版本参数（纯静态站浏览器缓存）。
- **部署前检查未跟踪文件**：引用未 git add 的图片 = Cloudflare 线上 404。
- **完成必写日志**：`AGENTS/LOG.md` 顶部追加一条（模型名/日期/目的/结果/验证/token/用时/经验）。
- **大任务完成前走完成检查表**：新增页面/资源、改 CSS 结构、批量改动（10+ 文件）、新增 class/id 等**大任务**，收尾前按 `AGENTS/RULES.md` §8.1 自查 5 项（路径规范 / 命名规则 / 链接可达 / 不违反组件规范 / 汇报文件列表）并逐项给证据；改错别字这类小任务不适用。
- **新坑写进 METHODS.md**，新规则写进 RULES.md，不要在 LOG 重复全文。

## 快速命令

```powershell
python -m http.server 8000            # 本地预览 + QA
python tools/build/build_blog.py      # blog 构建（改 article.md 后）
python tools/audit/_audit_site_images.py  # 全站图片审计（目标 Broken: 0）
```

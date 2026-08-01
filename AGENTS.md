# 1D Fansite — Agent 入口

> **FIVE GUYS ONE DIRECTION** — One Direction 粉丝社区网站。纯静态站（HTML/CSS/JS + jQuery），基于官方 onedirectionmusic.com 1:1 克隆 + fan editorial 内容。
>
> 维护者：Takion Kroslin / takionkroslin@icloud.com

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
- **小步改、快验证**：每改必验证；批量操作写幂等脚本。
- **改 CSS 必须 bump `?v=`** 版本参数（纯静态站浏览器缓存）。
- **部署前检查未跟踪文件**：引用未 git add 的图片 = Cloudflare 线上 404。
- **完成必写日志**：`AGENTS/LOG.md` 顶部追加一条（模型名/日期/目的/结果/验证/token/用时/经验）。
- **新坑写进 METHODS.md**，新规则写进 RULES.md，不要在 LOG 重复全文。

## 快速命令

```powershell
python -m http.server 8000            # 本地预览 + QA
python tools/build_blog.py            # blog 构建（改 article.md 后）
python tools/_audit_site_images.py    # 全站图片审计（目标 Broken: 0）
```

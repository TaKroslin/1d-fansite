# 1D Fansite — Agent 入口与项目概览

> FIVE GUYS ONE DIRECTION 是 One Direction 粉丝社区网站。纯静态 HTML/CSS/JS + jQuery，基于官方 `onedirectionmusic.com` 克隆并加入粉丝编辑内容。

## 开工必读

1. 本文件：项目边界和文档地图。
2. 按任务读取对应手册：
   - 页面、样式、组件：`AGENTS/DESIGN-SYSTEM.md`
   - 元素精准定位：`AGENTS/ELEMENT-NAMING.md`
   - 元素可视化对照：`AGENTS/ELEMENT-PREVIEWS.md`
   - 操作、QA、部署：`AGENTS/RULES.md`
   - 历史踩坑：`AGENTS/METHODS.md`
   - 命令速查：`AGENTS/COMMANDS.md`
   - 最近遗留：`AGENTS/LOG.md`
   - 候选 Skills：`AGENTS/SKILLS-ROADMAP.md`

## 项目事实

- 技术栈：纯静态站，无框架、无模块系统、无打包工具。
- CSS：`css/styles.css`，官方 minified 主体 + 文件末尾自定义补丁。
- JS：`js/main.js` 保留官方核心；新增交互使用独立文件或页面底部脚本。
- 共享字体：Google Fonts；中文字体和图标字体按设计系统配置。
- 开发预览：`python -m http.server 8000`。
- 部署：Cloudflare Workers 静态资源模式，正式域名为 `https://www.5guys1direction.asia/`。

## 目录速览

```text
index.html                 首页
pages/                     页面、Blog、Music、Gallery、Novel
journal/                   官方 Journal 克隆文章
css/styles.css             样式
js/                        官方及项目交互脚本
images/                    网站资源；images/psd/ 为不部署源文件
tools/build/               Blog、Novel、Gallery 构建器
tools/translate/           翻译和双语注入
tools/audit/               资源和元素审计
tools/templates/           生成页面模板
AGENTS/                    项目工作手册
```

## 不可违反的边界

- 不引入前端框架或打包系统。
- 不擅自修改现有 HTML `class` / `id`；准确名称以 `ELEMENT-NAMING.md` 为准。
- 不手改 Blog、Novel 等生成输出；修改源文件后运行对应构建脚本。
- `pages/shop.html` 禁止修改。
- 改 CSS 必须 bump 所有引用的 `styles.css?v=`。
- 新图片必须确认被 Git 跟踪；PSD 不作为部署资产。
- 每次完成改动必须写入 `AGENTS/LOG.md`。

## 常用命令

```bash
python -m http.server 8000
python tools/build/build_blog.py
python tools/build/build_novel.py
python tools/audit/_audit_site_images.py
python tools/audit/_audit_element_inventory.py
```

详细流程和验证层级以 `RULES.md` 为准；设计 token、Panel 结构、字体配对和响应式规则以 `DESIGN-SYSTEM.md` 为准。

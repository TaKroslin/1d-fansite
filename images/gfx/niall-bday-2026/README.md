# niall-bday-2026 — 首页 Niall 生日 panel 的贴纸图层

**这是一个整体的六个文件，不要拆开单独使用。** 它们原本是作者做的**一张图**，
为了做出「点击贴纸有反应」的交互动效，按图层拆成了多张同尺寸透明 PNG。
任何一张单独看都是残缺的，必须整组一起改。

| 文件 | 内容 | 交互 |
|------|------|------|
| `bg.png` | 爱尔兰国旗底 + 6 个 emoji 贴纸（2 面国旗 / 1 橙心 / 2 小船 / 1 月亮） | 无（点击冒 emoji） |
| `main.png` | 主人物：吃苹果的 Niall | 点击 → 轻微膨胀 |
| `sticker-top.png` | 小贴纸：红衣服惊讶的 Niall | 点击 → 轻轻晃一下 |
| `sticker-left.png` | 小贴纸：戴兔耳的 Niall | 点击 → 轻轻晃一下 |
| `sticker-right.png` | 小贴纸：年轻微笑的 Niall | 点击 → 轻轻晃一下 |

## 使用约定（改动前必读）

1. **全部 1200×1200，画布原点对齐**，在首页 `.niall-photo-panel` 里以 `left:0;top:0`
   整层叠放。**换图时六张必须同时替换**，且保持 1200×1200 同尺寸，否则会出现错位。
2. 面板渲染尺寸由 CSS 等比缩放（桌面 720px、移动端 390px）。
   **点击/悬停的命中判定 = JS 读本目录 PNG 的 alpha 通道**（`index.html` 的 `hitTest`），
   精确等于贴纸轮廓。**不要改用 CSS `clip-path` / `mask`** —— 实测两者在本项目环境都不生效
   （mask 只裁剪绘制不裁剪命中；clip-path 用外部 svg 引用和 data URI 都试过），
   换成 CSS 裁剪会让整块矩形都吃点击。详见 `AGENTS/METHODS.md` M62。
   **点击区域用百分比 `clip-path`**，不要改成 px —— px 是相对元素自身渲染尺寸的，
   换了断点就会裁错（详见 `AGENTS/METHODS.md` M61）。
3. 各贴纸的可点范围取自对应 PNG **alpha 通道的实测 bbox**，写在 `css/styles.css`
   的 `/* Niall Horan birthday panel */` 段。**重新导图后 bbox 可能变化，需要同步更新百分比。**
4. `bg.png` 已压成不透明白底（原导出画布本身是半透明的）。若重新导出，
   记得同样压白底，否则会透出面板底色。
5. PSD 源文件在 `images/psd/`（不部署）；作者侧的成品在 `~/Downloads/`。

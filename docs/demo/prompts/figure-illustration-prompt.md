# 倒计时 panel · 手绘人物插画 —— ChatGPT 出图 Prompt

> 用途：把作者的**两张合照**转成 Q 版手绘插画，之后抠出单个人物，做成
> `images/gfx/larry-anniv-2026/figure-louis.png` / `figure-harry.png`（透明 PNG），
> 供倒计时 panel 左右两侧使用。

## 0. 四条硬前提（先读，否则白出图）

1. **透明底直接要。** ChatGPT 图像生成（与 gpt-image-1 同一套）支持
   `background: transparent`，可以直出带 alpha 通道的 PNG。主方案就是直接要透明背景。
2. **但要验真伪。** 常见失败是模型"画"了一层灰白棋盘格或纯白底来假装透明。下载后验证：
   ```bash
   sips -g hasAlpha 图片路径.png      # 要看到 hasAlpha: yes
   file 图片路径.png                  # 正常带 alpha 的 PNG 会写 RGBA
   ```
   `hasAlpha: no` 一律退回第 5 节的 Plan B（洋红底）。
3. **不要要求"复刻长相"，这是政策红线。** OpenAI 禁止生成真人可识别肖像。
   下面这些写法一定会被拒，**一个都不要出现**：
   - `keep each person clearly recognisable`
   - `likeness` / `identity` / `portrait of`
   - `exact eyebrows / eye shape / nose / mouth / facial expression`
   - 明星真名（Harry Styles / Louis Tomlinson）

   正确方向：**"两个原创卡通角色"**，只借用照片里不涉及身份的要素——发型发色、
   服装颜色与款式、姿势、谁在左谁在右。Q 版插画的可辨识度本来就来自这四样，
   而脸部按卡通规范简化处理。
4. **用短句比长句更容易过。** 长篇逐项描述面部 = 越像"复刻某人"。
   第 1 节给的是短句主方案；第 2 节是更完整的细节版，被拒时退回第 1 节。

## 1. 主 Prompt（英文 · 短句 / 政策友好 · 附上照片直接粘）

```
This is personal, non-commercial use. I am making a celebration poster for myself
and a small circle of friends — a private keepsake, a fan tribute for a date that
matters to us. Nothing will be sold, printed for sale, advertised, or used as
merchandise, branding, packaging or promotion. It is not for public or commercial
distribution.

Turn the two people in the attached photo into two original cute chibi cartoon
characters, hand-drawn in bold black ink.

This is a stylised fan-art cartoon, NOT a portrait. Do not reproduce their facial
identity and do not aim for a realistic likeness — design simple, generic cartoon
faces instead. Only borrow the non-identifying things from the photo:
their hair colour and hair silhouette, their outfit colours and clothing type,
their pose, and who stands on the left and who stands on the right.

STYLE
- Very chibi / Q-version: head about 2.2x the body height, big round head, small
  rounded body, short stubby limbs.
- Bold black ink pen outlines, thick (about 8px at 1024px), clean hand-drawn feel.
- Flat colour fill only. No gradients, no shading, no hatching, no halftone, no
  drop shadow, no 3D, no realistic rendering.

COLOUR
- Only black, plus two flat colours.
- The character on the LEFT uses blue #1e4d6e for their outfit and the iris of
  their eyes.
- The character on the RIGHT uses green #2f5d4e for their outfit and the iris of
  their eyes.
- Skin left unfilled: black outline only, so what is behind them shows through.
- No other colours.

COMPOSITION
- Both full body, head to toe, standing side by side, facing the viewer.
- A clear empty gap between them; they must not touch, overlap or share any line,
  so each one can be cut out separately later.
- Centred, with generous empty margin on all four sides.

BACKGROUND
- Fully transparent background with a real alpha channel, edge to edge, including
  the gap between the two characters.
- No white fill, no colour fill, no painted checkerboard, no gradient, no texture,
  no scenery, no floor, no shadow under the feet.
- Only the two characters are painted. Nothing else exists in the image.

FORBIDDEN
- No text, letters, numbers, logo, signature or watermark.
- No border, no frame, no vignette.
- No extra props, sparkles, hearts, stars, dust or background objects.
- No speech bubbles.

OUTPUT
- PNG with transparency enabled, square 1024x1024, flat vector-like look, crisp
  edges, high contrast, no white fringe.
```

## 2. 完整细节版（主方案被拒或质量不满意时再用）

在第 1 节基础上，把 `This is a stylised fan-art cartoon...` 那一段替换为：

```
This is a stylised fan-art cartoon, NOT a portrait. Do not reproduce their facial
identity and do not aim for a realistic likeness — design simple, generic cartoon
faces instead.

Borrow only non-identifying elements:
- hair: colour, length, curl or straight, the overall hair silhouette
- outfit: clothing type and colour blocking
- pose: body angle, arm position, stance
- staging: who stands on the left, who on the right, relative heights

Do NOT copy facial features, and do not make the faces resemble the people in the
photo. Faces should follow generic chibi cartoon rules: round head, simple dot or
curved-line eyes, small nose, tiny curved mouth, optional blush.
```

## 3. 两张照片 / 左右对调

同一段 prompt 用在两张照片上，只需**按每张照片里两人实际的左右位置**核对一次：

- 默认（蓝＝Louis、绿＝Harry）：照片里 **Louis 在左** → 原样用。
- 照片里 **Louis 在右** → 把 `LEFT` 与 `RIGHT` 两段的颜色互换：
  左侧改 `#2f5d4e`（绿），右侧改 `#1e4d6e`（蓝）。

## 4. 被拒了怎么办（按顺序试）

0. **先把用途说清楚（最高性价比的一步）**。开头明确写"个人自用、非商用"，把商业风险这一层
   从判定里摘掉——模型对"用途不明 + 真人照片"会默认按最坏情况处理。照抄这段放 prompt 最前面：

   ```
   This is personal, non-commercial use. I am making a celebration poster for myself
   and a small circle of friends — a private keepsake, a fan tribute for a date that
   matters to us. Nothing will be sold, printed for sale, advertised, or used as
   merchandise, branding, packaging or promotion.
   ```

   中文工具用：
   ```
   这是我个人自用的纪念海报，非商用、不售卖、不印刷出售、不用于广告或商品周边，
   只在自己和朋友的小圈子里留存。是一份粉丝心意。
   ```

   ⚠️ 说清楚用途能明显降低"商业滥用"这条判定，但**它不解除"真人可识别肖像"这条**——
   那条和商不商用无关。所以这一步之后若仍被改脸，直接进下面第 3 条，别在同一工具上再耗。

1. **换一个新会话重试**。政策判定有随机性，同样的话在新会话里过的概率不低。
   如果它给了"请重试或修改"的提示，就说明属于可复议范围。
2. **继续缩短 prompt**：只留"两段"——
   `Personal non-commercial fan art. Turn the two people in the attached photo into
   original chibi cartoon characters, bold black ink outlines, flat blue #1e4d6e on
   the left character and flat green #2f5d4e on the right character, transparent
   background PNG.`
3. **换工具**。真人的卡通化在各家政策差异很大，这几条路对"真人 → Q 版插画"通常更宽松：
   - 即梦 AI / 豆包（中文界面，手绘 Q 版很强，透明底需导出后处理）
   - Midjourney（`--style raw` + 参考图，无透明底，需自行抠）
   - 本地 ComfyUI / Stable Diffusion（完全无政策限制，但要有显卡与工作流）
4. **最后手段**：先让工具出一版"通用 Q 版双人插画"（不带照片），
   只定风格、线条、蓝绿配色、透明底；再单独解决"像不像"。

## 5. Plan B：万一透明底出不来

如果拿到白底或假棋盘格（`hasAlpha: no`），把整个 `BACKGROUND` 段换成：

```
BACKGROUND
- Completely flat, uniform, solid magenta background, exact hex #FF00FF, covering the
  whole canvas edge to edge and the gap between the two characters.
- No gradient, no texture, no scenery, no floor, no shadow under the feet.
```

洋红与黑线、蓝、绿、肤色都不撞色，用"色彩范围"一键移除，比在白底上抠线稿干净得多。

## 6. 交付（拿到图之后）

1. **验真**：`sips -g hasAlpha 文件.png` → `hasAlpha: yes`。
2. **剪开**：把两个人分别裁成两张独立 PNG，四周留 8–16px 透明边。
   边缘有白描边/灰阶锯齿就在 prompt 里加 `no anti-alias halo, no white fringe` 重出。
3. **命名与放置**（与倒计时 panel 的占位块一一对应）：
   - `images/gfx/larry-anniv-2026/figure-louis.png`
   - `images/gfx/larry-anniv-2026/figure-harry.png`
   - 规格：透明 PNG、竖构图、**3:4**、建议 **1200×1600**
     （比例要改只改 CSS 里 `--larry-figure-ratio` 一处）
4. **必须 Git 跟踪**：未 `git add` 的图在 Cloudflare 线上就是 404；
   收尾跑 `python tools/audit/_audit_site_images.py`（目标 `Broken: 0`）。

## 7. 迭代话术（同一会话里继续追问）

- 线条太细/太抖 → `Make the black outlines thicker and smoother, about 12px at 1024px.`
- 两人粘在一起 → `Increase the empty gap between them until they share no line at all.`
- 冒出多余颜色 → `Remove every colour except black, #1e4d6e and #2f5d4e.`
- 背景变白 / 出现假棋盘格 → `The background must be fully transparent with a real alpha
  channel. Do not paint white, do not paint a checkerboard pattern, do not paint
  anything behind them.`
- 边缘有白边 → `Clean up the edges: no white fringe, no anti-alias halo, crisp outlines.`
- 想更像 → **不要**回去要求"复刻五官"（会被拒）。改从这四处入手：
  `Keep the hairstyle silhouette, the outfit and the pose as close as possible to the
  photo, while the face stays a generic cartoon face.`

## 8. 如果图被审核"改过了"（脸被重绘 / 内容被替换）

**这不是 prompt 问题，是工具选择问题。** OpenAI 对真人可识别性的处理不只在"拒答"这一层，
它还会在生成之后把不符合的脸重绘掉——你已经拿到图、但脸被动过，就是这一层在生效。
换更宽松的工具是唯一实际出路：

| 工具 | 对"真人合照 → Q 版插画"的松紧 | 透明底 | 备注 |
|---|---|---|---|
| **即梦 AI / 豆包**（字节） | 最松，图生图 + 参考图，国内直连 | 多为纯色底 + 自带智能抠图 | 首选，中文界面，手绘 Q 版很强 |
| **通义万相 / 腾讯混元 / 快手可图** | 松，同上有参考图模式 | 同上 | 备选，效果接近 |
| **Midjourney** | 中等，`--cref` 可锁角色一致性 | ❌ 需自己抠 | 手绘线条质量最高，但要会参数 |
| **本地 ComfyUI / Stable Diffusion** | **无限制** | 可直出 alpha | 保相似度最强（IP-Adapter / ControlNet），代价是要显卡和装环境 |

### 8.1 国内工具用的中文 Prompt（图生图 / 参考图模式）

```
这是我个人自用的纪念海报，非商用、不售卖、不印刷出售、不用于广告或商品周边，
只在自己和朋友的小圈子里留存，是一份粉丝心意。

参考图：上传合照，参考强度中低（保留姿势与服装，允许卡通化重绘）

Q 版可爱卡通插画，2 头身，大头圆脸，身体圆小，四肢短短。
黑色粗线手绘勾线，线条清晰有手绘感，平涂上色，扁平矢量感。
画面里两个男生并排站立，全身照（头顶到脚），面向镜头，
两人之间留出明显空隙，不许接触、不许重叠、不许共用线条。
左边的人物：衣服和瞳孔都用蓝色 #1e4d6e。
右边的人物：衣服和瞳孔都用绿色 #2f5d4e。
皮肤、脸、手不填色，只保留黑色线条。

背景：纯色平底（洋红 #FF00FF 或纯白），无渐变、无纹理、无场景、无地面、无脚下阴影。
画面里只有这两个人物。

负向词：写实，照片，真人，3D，渐变，阴影，排线，网点，文字，字母，
水印，签名，logo，边框，画框，暗角，多余道具，闪光，爱心，星星，对话气泡，
两人重叠，共用线条
```

拿到纯色底版本后走第 5 节的抠图流程；若该工具支持导出透明 PNG，直接走第 6 节验真。
**左右对调规则同第 3 节**（照片里 Louis 在右就把蓝绿互换）。

## 9. 不阻塞网站工作

插画是"图后补"的资产，不该卡住倒计时 panel 的搭建。在插画定稿之前，
可以先在 demo 里放**同比例（3:4）的 SVG 线稿占位**：黑线 + 蓝绿衣、透明底、
`aria-label` 标好是谁。这样面板的构图、比例、响应式、动效、抠图位置全都能先跑通验证，
真插画一到就替换（只改 CSS 里两行 `background-image`）。

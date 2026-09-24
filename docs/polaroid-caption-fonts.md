# Polaroid 短题注字体候选（手写 / 签字笔感）— 已逐条 curl 验证

**日期**：2026-09-24
**用途**：给 `docs/demo/index-demo-after-928.html` 的 Polaroid 短题注
（`.larry-pola-cap`，40 条中文，`clamp(.86rem,1.3vw,1.2rem)` ≈ 14–19px，单行）
找一款「近似手写 / 签字笔感」的中文字体。

**比选图**：`tools/_qa_screenshots/polaroid-caption-fonts/cjk-handwriting-sheet.png`
（10 款中文 + 2 款英文，用**真实的 40 条题注**渲染）。

---

## 一、结论（推荐顺序）

| # | 字体 | 手感 | 许可 | 建议 |
|---|------|------|------|------|
| 1 | **演示佛系体 Slidefu** | 中性笔/签字笔随手写，字重够，**小字号最清楚** | ⚠️ 名表写 `All rights reserved`（演示字体是"免费商用"，但**不得再分发字体文件**） | 最好看；自托管前请确认授权 |
| 2 | **演示悠然小楷 slideyouran** | 钢笔小楷，笔画细而匀，最"钢笔" | ⚠️ 同上 | 最秀气；14px 会偏细，建议题注字号再大一点 |
| 3 | **小赖字体 SC Xiaolai SC** | 硬笔手写，圆润流畅 | ✅ **SIL OFL 1.1**（名表 `LicenseDescription` 明写，`LicenseURL: scripts.sil.org/OFL`） | **公开站点唯一零风险的选项** |

> 演示字体（演示佛系体 / 演示悠然小楷）均出自 keynoteart，属于"免费商用但禁止二次分发"。
> 自建站**自托管**字体文件时属于再分发，请以官方页面授权说明为准。
> **要完全合规就用 小赖字体 SC（OFL）**。

## 二、可直接用的 CDN 地址（全部实测 `200`）

### 1) 演示佛系体（Slidefu）— 首选手感

```
CSS : https://cdn.jsdelivr.net/npm/@chinese-fonts/ysfxt/dist/Slidefu-Regular/result.css
WOFF2 示例（其中一个子集，已验证 200 / 3824 B / font/woff2）:
      https://cdn.jsdelivr.net/npm/@chinese-fonts/ysfxt/dist/Slidefu-Regular/acdb527abf0665adf5eff846ce9c1544.woff2
font-family: 'Slidefu'
```

### 2) 演示悠然小楷（slideyouran）— 最像钢笔

```
CSS : https://cdn.jsdelivr.net/npm/@chinese-fonts/ysyrxk/dist/slideyouran-Regular2_0/result.css
WOFF2 示例（已验证 200 / 51840 B / font/woff2）:
      https://cdn.jsdelivr.net/npm/@chinese-fonts/ysyrxk/dist/slideyouran-Regular2_0/012e19f077208b0711a2f9e7b0f0f71d.woff2
font-family: 'slideyouran'
```

> ⚠️ **路径坑**：该包的 `dist/index.json` 里写的目录名是 `slideyouran-Regular2.0`，
> 但 jsdelivr 上真实目录是 **`slideyouran-Regular2_0`**（点被规范化成下划线）。
> 用 `2.0` 那条路径能取到 CSS，但它属于**旧版本**，里面的 woff2 文件名全是 404 的。
> **必须用 `2_0`。**

### 3) 小赖字体 SC（Xiaolai SC）— 许可最干净

```
CSS : https://cdn.jsdelivr.net/npm/@chinese-fonts/xiaolai/dist/Xiaolai/result.css
WOFF2 示例: https://cdn.jsdelivr.net/npm/@chinese-fonts/xiaolai/dist/Xiaolai/212aab49e972364c740c332ee7770d1e.woff2
font-family: 'Xiaolai SC'
```

### 备选（也都实测 200，但风格不是"签字笔"）

| 字体 | CSS | family | 备注 |
|---|---|---|---|
| 江西拙楷 | `.../@chinese-fonts/jxzk/dist/江西拙楷/result.css` | `jiangxizhuokai` | 硬笔拙楷，许可未在名表声明 |
| 玄冬楷书 | `.../@chinese-fonts/xuandongkaishu/dist/XuandongKaishu/result.css` | `XuandongKaishu` | 硬笔楷，干净 |
| 白路棒棒手写体 | `.../@chinese-fonts/blbbsxt/dist/白路棒棒手写体/result.css` | `bailubangbangshouxieti` | 偏马克笔，笔画重 |
| 悠哉字体 | `.../@chinese-fonts/yozai/dist/Yozai-Regular/result.css` | `Yozai` | 偏圆体（作者已排除"太圆"） |
| 随峰体 | `.../@chinese-fonts/sft/dist/随峰体/result.css` | `The Peak Font 隨峰體 Beta` | ⚠️ 比选图里见**缺字回退混排**，不要用 |

（`.../` = `https://cdn.jsdelivr.net/npm`；中文目录名要 URL 编码）

## 三、`@font-face` / 引入片段

### 用法 A：直接引 result.css（最稳，推荐）

这系列包是 **cn-font-split 切好的几百个子集**，靠 `unicode-range` 按需加载，**不要**指望单个 woff2 覆盖全部汉字。

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@chinese-fonts/ysfxt/dist/Slidefu-Regular/result.css">
```
```css
.larry-pola-cap{ font-family:'Slidefu','LXGW WenKai','LXGW WenKai Mono',cursive; }
```

### 用法 B：一定要写成 inline `@font-face`

**注意坑**：`result.css` 里的 `url("./xxx.woff2")` 是**相对路径**，直接贴进页面 `<style>` 会
按**页面**解析 → 全 404。必须先批量绝对化：

```bash
curl -s https://cdn.jsdelivr.net/npm/@chinese-fonts/ysfxt/dist/Slidefu-Regular/result.css \
 | sed 's|url("\./|url("https://cdn.jsdelivr.net/npm/@chinese-fonts/ysfxt/dist/Slidefu-Regular/|g' \
 > slidefu.inline.css     # 然后把 slidefu.inline.css 整个贴进 <style>
```

（要「一条就够用」的 `@font-face`，正确做法是**自托管子集**，见第四节。）

## 四、英文候选（都已验证 200，均为 OFL）

| 字体 | 气质 | CSS | WOFF2 直链 |
|---|---|---|---|
| **Patrick Hand** | 均匀、端正的"签字笔印刷体"，**与硬笔中文最搭** | `https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap` | `https://fonts.gstatic.com/s/patrickhand/v25/LDI1apSQOAYtSuYWp8ZhfYe8UcLLubg58xGL.woff2` |
| **Caveat** | 随意手写、略带连笔，更暖 | `https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap` | `https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIipYT5Kmgq3s84t.woff2` |

站内现在用的是 v1 API 合并链接，可直接追加：

```
https://fonts.googleapis.com/css?family=Caveat|Patrick+Hand&display=swap     ← 已验证 200
```

## 五、给出题注的落地建议

1. **`.larry-pola-cap` 目前 EN/ZH 共用一条线、一个字体**，没有 `.en/.zh` 拆分。
   中文字体定了之后，建议写成
   `font-family:'Slidefu','Patrick Hand','LXGW WenKai',cursive;`
   —— 中文走中文字体，英文/数字自动落到 Patrick Hand（各自的字体里都没有对方的字形）。
2. **不要直接引 CDN 上那几百个子集**：本站惯例是自托管。40 条题注一共只有百来个不同汉字，
   可以子集化成 **10–30KB 的单个 woff2** 放进 `assets/fonts/`，再配一条 `@font-face`，
   又快又只在一个文件里。
3. 若题注用「演示悠然小楷」这种细笔画字体，**建议把 `clamp` 下限从 `.86rem` 提到 `1rem` 左右**，
   否则 14px 下笔画会发虚。

---

## 六、最终落地（2026-09-24 作者定稿）

**中文 = 瑞美加张清平硬笔行书（Ramega Zhang Qingping Hard-pen Xingshu）**
**英文 = Caveat（Google Fonts，OFL）**

### 怎么接的

1. **中文自托管子集**（不引 CDN，国内不稳）：
   `assets/fonts/zhangqingping-hyx/ZQP-Hardpen-Xingshu-Subset.woff2` —— **38.4 KB**
   只含 40 条题注用到的 102 个汉字（覆盖 102/102）。
   原 CDN 包把字体切成 142 个子集，这 102 字**横跨 53 个子集 / 1.9 MB**；
   故先 `fontTools.merge` 合成一个 TTF，再 `fontTools.subset` 重切。
   复现：`/tmp/fontvenv/bin/python tools/fonts/subset_hardpen_xingshu.py --apply`
   授权/来源见 `assets/fonts/zhangqingping-hyx/README.txt`
   （名表声明 `LicenseDescription: Free for commercial used`、`LicenseURL: www.52type.com`；**不是 OFL**）。

2. **英文**：页头 Google Fonts v1 链接追加 `|Caveat:400,700`。

3. **CSS**（`docs/demo/css/larry-anniv-after.css`）：
   ```css
   @font-face{font-family:'Hardpen Xingshu';src:url(../../../assets/fonts/zhangqingping-hyx/ZQP-Hardpen-Xingshu-Subset.woff2) format('woff2');font-style:normal;font-weight:400;font-display:swap;}

   .larry-pola-cap{
     font-family:'Hardpen Xingshu','Caveat','LXGW WenKai','LXGW WenKai Mono',cursive;
     font-size:clamp(.95rem,1.8vw,1.55rem);
     font-size:min(clamp(.95rem,1.8vw,1.55rem),13.5cqw);   /* 卡片已是 inline-size 容器 */
   }
   /* ⚠️ 这两条不能省：styles.css 的 `html .zh{font-family:'LXGW WenKai'…}` 直接落在 span 上 */
   .larry-pola-cap .zh{font-family:'Hardpen Xingshu','LXGW WenKai','LXGW WenKai Mono',cursive;}
   .larry-pola-cap .en{font-family:'Caveat','LXGW WenKai','LXGW WenKai Mono',cursive;}
   ```

### 字号上限的规律（重要）

题注是 `white-space:nowrap` + `text-overflow:ellipsis`，所以**字号一旦超过「内宽 ÷ 最长题注」就被省略号吃掉**：

```
不裁切上限 = 0.96 × 卡片内宽 ÷ 最长题注(7 个汉字 = 7em) ≈ 13.7% 卡片内宽
           （实测 1440 / 1280 / 768 / 390 / 360 五档全部落在 13.6%~13.7%）
```

因此 `.larry-pola-card` 加了 `container-type:inline-size`，题注用 `min(想要的大小, 13.5cqw)` 顶住。
注意 **`cqw` 相对的是卡片内容盒**（已扣掉左右 6% 白边），不是边框盒。

| 视口 | 卡宽 | 改前字号 | 改后字号 | 变化 |
|---|---|---|---|---|
| 1440 | 266 | 18.72 | **24.8** | +32% |
| 1280 | 229 | 16.64 | **23.0** | +38% |
| 768 | 112 | 13.76（已在被截） | 13.27 | 不再被截 |
| 390 | 133 | 14.4 | **15.85** | +10% |
| 360 | 123 | 14.4 | 14.63 | +2% |

**移动端想再大只能二选一**（都会动到已定稿的东西，等作者定）：
① 移动端 `--pola-w` 从 38% 加宽（动牌堆几何）；
② 把最长的两条题注（「同款条纹同款赞」「T 恤上写着答案」，7 字）压到 5 字内。

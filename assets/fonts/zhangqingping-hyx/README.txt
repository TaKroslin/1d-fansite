瑞美加张清平硬笔行书  （Ramega Zhang Qingping Hard-pen Xingshu）
================================================================

作者 / 版权
  name table: CopyrightNotice = Ramega
              ManufacturerName = Ramage / DesignerName = Ramage
              LicenseDescription = "Free for commercial used"
              LicenseURL = www.52type.com
  ⚠️ 本字体**不是** SIL OFL；名表只声明"免费商用"。要挪作他用请回 52type.com 核对授权。

来源
  npm 包 @chinese-fonts/rmjzqpybxs（中文网字计划 https://chinese-font.netlify.app 用
  cn-font-split 切好的 woff2 子集，共 142 个）
  原始 CSS:
    https://cdn.jsdelivr.net/npm/@chinese-fonts/rmjzqpybxs/dist/瑞美加张清平硬笔行书/result.css

本目录的文件
  ZQP-Hardpen-Xingshu-Subset.woff2   38.4 KB
      —— **子集化的衍生品，不是原字体文件**。
      只含 Polaroid 40 条短题注用到的 102 个汉字（103 字形，含 .notdef）；
      cmap 覆盖 102/102，无缺字。
      做法：取覆盖这 102 字的 53 个 CDN 子集 → fontTools.merge 合成一个 TTF（2104 字形）
      → fontTools.subset --text=<40 条题注> --flavor=woff2（保留 hinting）重切。
      引擎：fontTools 4.65 + brotli；脚本为一次性，复现步骤见 AGENTS/LOG.md 2026-09-24 条目。

为什么不直接引 CDN
  那 142 个子集对"只有 102 个字"的场景要拉 53 个文件 / 1.9 MB；
  重切成单一 woff2 后是 38.4 KB，且不依赖 jsdelivr（国内访问不稳）。

/* 小红书卡组渲染器 v2（一次性脚本）
   raw 截图 → PIL 切片 → HTML 排版 → Playwright 导出 1080×1440
   产出：before 套 3 张 + after 套 8 张 = 11 张
   运行：NODE_PATH=/opt/homebrew/lib/node_modules/openclaw/node_modules node tools/_qa_xhs_deck.js
*/
const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '_qa_screenshots', 'xhs-928', 'raw');
const OUT = path.join(__dirname, '_qa_screenshots', 'xhs-928');
const TMP = path.join(OUT, '_deck');
const W = 1080, H = 1440;
const PY = '/Users/takionkroslin/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3';

fs.mkdirSync(TMP, { recursive: true });

const META = JSON.parse(execFileSync(PY, ['-c', `
import json, os
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
d={}
for f in os.listdir(r"${RAW}"):
    if f.endswith(".png"):
        d[f]=Image.open(os.path.join(r"${RAW}",f)).size
print(json.dumps(d))
`]).toString());

/* 按原图像素裁切 → 缩到 outW 宽 → 落盘 */
function cut(from, top, height, name, outW = 1080, blurPx = 0) {
  const out = path.join(TMP, name);
  execFileSync(PY, ['-c', `
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS=None
im=Image.open(r"${path.join(RAW, from)}")
W,H=im.size
top=max(0,min(${top},H-1)); bot=max(top+1,min(${top+height},H))
im=im.crop((0,top,W,bot))
nw=${outW}; nh=max(1,round(im.height*nw/im.width))
im=im.resize((nw,nh), Image.LANCZOS)
if ${blurPx}: im=im.filter(ImageFilter.GaussianBlur(${blurPx}))
im.save(r"${out}")
`]);
  const [iw, ih] = JSON.parse(execFileSync(PY, ['-c', `import json;from PIL import Image;print(json.dumps(Image.open(r"${out}").size))`]).toString());
  return { url: 'file://' + out, w: iw, h: ih };
}

const cards = [];
const card = (file, html) => cards.push({ file, html });

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:"PingFang SC","Hiragino Sans GB","Source Sans Pro",sans-serif;background:#faf6ef;color:#141b21}
.hei{font-family:"PingFang SC","Hiragino Sans GB",sans-serif}
.serif{font-family:"Playfair Display",Georgia,serif}
.song{font-family:"Songti SC",Georgia,serif}
.mono{font-family:"Source Code Pro",Menlo,monospace;letter-spacing:.12em}
.fill{position:absolute;inset:0}
.gold{color:#c9a86a}.blue{color:#1e4d6e}.green{color:#2f5d4e}
.h1{font-size:80px;font-weight:800;line-height:1.16;letter-spacing:-.01em}
.h2{font-size:46px;font-weight:800;line-height:1.3}
.eyebrow{font-size:26px;font-weight:600;letter-spacing:.04em}
.lead{font-size:31px;line-height:1.72;color:#3a3a3a}
.li{font-size:30px;line-height:1.6;margin-bottom:20px;display:flex;gap:14px;align-items:flex-start}
.li b{font-weight:800}
.dot{flex:0 0 auto;color:#c9a86a;font-weight:800}
.callout{border-radius:20px;padding:38px 40px;font-size:31px;line-height:1.6;font-weight:600}
.callout.dark{background:#141b21;color:#faf6ef}
.callout.gold{background:#f3e7cf;color:#141b21}
.callout.blue{background:#e8f1f6;color:#141b21}
.shot{display:block;width:100%;height:auto;border-radius:4px}
.calloutBot{position:absolute;left:64px;right:64px;bottom:130px}
.teaser{position:absolute;left:64px;right:64px;bottom:112px;text-align:center;color:#9a958a;font-size:24px;letter-spacing:.04em}
.tgrid{display:grid;grid-template-columns:1fr 1fr;gap:0;border:3px solid #141b21;border-radius:10px;overflow:hidden;background:#141b21}
.tgrid img{display:block;width:100%;height:100%;object-fit:cover}
.tcell{overflow:hidden;background:#fff}
.tcell+.tcell{border-left:3px solid #141b21}
.tgrid .tcell:nth-child(3),.tgrid .tcell:nth-child(4){border-top:3px solid #141b21}
.tgrid .tcell:nth-child(3){border-left:none}
.onDark{color:#faf6ef}
`;

function page(body, opts = {}) {
  const foot = opts.noFoot ? '' : `
  <div style="position:absolute;left:64px;right:64px;bottom:36px;display:flex;justify-content:space-between;align-items:center;color:${opts.footColor || '#9a958a'};font-family:'Source Code Pro',Menlo,monospace;font-size:21px;letter-spacing:.12em">
    <span>@5guys1direction</span><span>${opts.foot || ''}</span></div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${path.join(TMP, 'fonts.css')}">
<style>${CSS}</style></head><body>${body}${foot}</body></html>`;
}

const shot = (a) => `<img class="shot" src="${a.url}">`;
const li = (t) => `<div class="li"><span class="dot">·</span><span>${t}</span></div>`;

(async () => {
  /* ================= 素材 ================= */
  const bh = META['before-hero.png'], bf = META['before-full.png'];
  const bHero  = cut('before-hero.png', 0, Math.round(bh[1] * 0.66), 'bHero.png');
  const bClock = cut('before-hero.png', Math.round(bh[1] * 0.19), Math.round(bh[1] * 0.365), 'bClock.png');
  const bBelow = cut('before-full.png', 800, 1500, 'bBelow.png');

  const aHero  = cut('after-full.png', 0, Math.round(720 * 1.25), 'aHero.png');
  const aLead  = cut('after-full.png', Math.round(784 * 1.25), Math.round(720 * 1.25), 'aLead.png');
  const aPola  = cut('after-pola-panel.png', 0, META['after-pola-panel.png'][1], 'aPola.png');
  const aFan   = cut('after-full.png', 2780, 900, 'aFan.png');
  const a928   = cut('after-full.png', 3950, 560, 'a928.png');

  const tAnchor  = cut('tattoo-anchor.png', 0, META['tattoo-anchor.png'][1], 'tAnchor.png', 476);
  const tShip    = cut('tattoo-ship.png', 0, META['tattoo-ship.png'][1], 'tShip.png', 476);
  const tRose    = cut('tattoo-rose.png', 0, META['tattoo-rose.png'][1], 'tRose.png', 476);
  const tCompass = cut('tattoo-compass.png', 0, META['tattoo-compass.png'][1], 'tCompass.png', 476);
  const vPanel = cut('video-panel.png', 0, META['video-panel.png'][1], 'vPanel.png');

  // 真机竖屏（390×844 视口整屏，9:19.5，不裁）
  const mHero  = cut('m-hero.png', 0, META['m-hero.png'][1], 'mHero.png', 320);
  const mPola  = cut('m-pola.png', 0, META['m-pola.png'][1], 'mPola.png', 320);
  const mFan   = cut('m-fanart.png', 0, META['m-fanart.png'][1], 'mFan.png', 320);
  const m928   = cut('m-928.png', 0, META['m-928.png'][1], 'm928.png', 320);

  Object.entries({ bHero, bClock, bBelow, aHero, aLead, aPola, aFan, a928, mHero, mPola, mFan, m928 })
    .forEach(([k, v]) => console.log(' ', k, v.w + 'x' + v.h));

  /* =========================================================
     A 套 · 倒计时（9·28 前发）
     ========================================================= */

  card('before-1-cover.png', page(`
    <div class="fill" style="background:#141b21;color:#faf6ef"></div>
    <div style="position:absolute;top:0;left:0;right:0;height:560px;overflow:hidden">${shot(bHero)}</div>
    <div class="onDark" style="position:absolute;top:606px;left:64px;right:64px">
      <div class="eyebrow gold" style="font-family:'Source Code Pro',monospace;letter-spacing:.14em">2026 · 09 · 28 ｜ 倒计时进行中</div>
    </div>
    <div class="onDark" style="position:absolute;top:662px;left:64px;right:64px">
      <div class="hei" style="font-size:78px;font-weight:800;line-height:1.16">离那天<br>只剩两天了</div>
    </div>
    <div class="onDark" style="position:absolute;top:858px;left:64px;right:64px">
      <div class="lead" style="color:#c9c3b6">首页上挂了一个真的在走的倒计时<br>归零那一刻，它会自己消失</div>
    </div>
    <div style="position:absolute;left:64px;top:975px;width:88px;height:4px;background:#c9a86a"></div>
    <div class="onDark" style="position:absolute;top:1010px;left:64px;right:64px">
      <div class="callout" style="background:#1e4d6e;color:#fff">
        这一版首页<br>只在 9·28 之前存在 🕐
      </div>
    </div>
    <div class="onDark" style="position:absolute;top:1220px;left:64px">
      <div class="mono gold" style="font-size:26px">www.5guys1direction.asia</div>
    </div>
  `, { foot: '1 / 5', footColor: '#6f6a5f' }));

  card('before-2-clock.png', page(`
    <div class="fill" style="background:#faf6ef;padding:66px 64px 0">
      <div class="eyebrow blue">COUNTING DOWN · 倒计时</div>
      <div class="h2" style="margin-top:16px">它不是在装样子<br>是真的在一秒一秒走</div>
      <div style="margin-top:44px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(bClock)}</div>
      <div style="margin-top:52px">
        ${li('天 / 时 / 分 / 秒，<b>北京时间 2026.09.28 00:00</b> 归零')}
        ${li('左边那句 <b class="blue">Oops!</b>、右边那句 <b class="green">Hi</b>：他俩对彼此说的第一句话')}
        ${li('后来这两句被各自纹在了身上 👀')}
      </div>
      <div class="callout blue" style="margin-top:52px">
        倒计时不会停，<br>也不会有人来提醒你。
      </div>
    </div>
  `, { foot: '2 / 5' }));

  card('before-3-next.png', page(`
    <div style="position:absolute;top:0;left:0;right:0;height:600px;overflow:hidden">${shot(bBelow)}</div>
    <div style="position:absolute;top:608px;left:0;right:0;bottom:0;background:#faf6ef;padding:44px 64px 0">
      <div class="eyebrow gold">AFTER · 归零之后</div>
      <div class="h2" style="margin-top:14px">倒计时下线那一秒<br>首页会整套换掉</div>
      <div style="margin-top:26px">
        ${li('28 号之前点进来，看到的才是这一版')}
        ${li('28 号之后，倒计时连痕迹都不留')}
        ${li('换成什么？先不说 😌')}
      </div>
      <div class="callout dark" style="margin-top:22px">
        现在来一趟<br>你能同时看到「之前」和「之后」👀
      </div>
    </div>
  `, { foot: '3 / 5' }));

  /* A4 · 封面卡 = 他们的纹身 */
  card('before-4-tattoo.png', page(`
    <div class="fill" style="background:#faf6ef;padding:58px 64px 0">
      <div class="eyebrow green">TATTOO · 纹身</div>
      <div class="h1" style="margin-top:10px;font-size:58px">封面不是随便贴的图<br>是他们身上的纹身</div>
      <div class="tgrid" style="margin-top:30px;height:1006px">
        <div class="tcell"><img src="${tAnchor.url}"></div>
        <div class="tcell"><img src="${tShip.url}"></div>
        <div class="tcell"><img src="${tRose.url}"></div>
        <div class="tcell"><img src="${tCompass.url}"></div>
      </div>
      <div class="calloutBot" style="bottom:112px"><div class="callout gold" style="font-size:30px;padding:32px 38px">
        往下翻还有 Oops!、Hi、绳和匕首。<br>整整八张封面，八个纹身 😌
      </div></div>
    </div>
  `, { foot: '4 / 5' }));

  /* A5 · 最下面的视频 */
  card('before-5-video.png', page(`
    <div class="fill" style="background:#eef7f2;padding:62px 56px 0">
      <div class="eyebrow blue">VIDEO · 视频</div>
      <div class="h1" style="margin-top:12px;font-size:66px">翻到最后有惊喜</div>
      <div style="margin-top:32px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(vPanel)}</div>
      <div style="margin-top:36px;padding:0 8px">
        ${li('首页滑到最底下，就是这面墙')}
        ${li('点右下那个绿色三角，会直接开播')}
        ${li('内容是我在 B 站挑的一个<b>超长 Larry 合集</b>')}
      </div>
      <div class="calloutBot"><div class="callout blue">
        别急着一次看完。<br>这是留着慢慢回顾的，一次看一点刚刚好 🍿
      </div></div>
    </div>
  `, { foot: '5 / 5', footColor: '#2f5d4e' }));

  /* =========================================================
     B 套 · 9·28 之后（当天发）
     ========================================================= */

  card('after-1-cover.png', page(`
    <div class="fill" style="background:#141b21;color:#faf6ef"></div>
    <div style="position:absolute;top:0;left:0;right:0;height:${aHero.h}px;overflow:hidden">${shot(aHero)}</div>
    <div class="onDark" style="position:absolute;top:${aHero.h + 40}px;left:64px;right:64px">
      <div class="eyebrow gold" style="font-family:'Source Code Pro',monospace;letter-spacing:.14em">28 · 09 · 2013 → 2026</div>
    </div>
    <div class="onDark" style="position:absolute;top:${aHero.h + 96}px;left:64px;right:64px">
      <div class="hei" style="font-size:78px;font-weight:800;line-height:1.16">倒计时归零了<br>首页换了一整套</div>
    </div>
    <div class="onDark" style="position:absolute;top:${aHero.h + 286}px;left:64px;right:64px">
      <div class="lead" style="color:#c9c3b6">7 个板块，我一个个讲给你听<br>每个都不是随手摆的</div>
    </div>
    <div style="position:absolute;left:64px;top:${aHero.h + 400}px;width:88px;height:4px;background:#c9a86a"></div>
    <div style="position:absolute;top:${aHero.h + 434}px;left:64px;display:flex;gap:14px">
      <span style="background:#e8f1f6;color:#141b21;border-radius:999px;padding:14px 26px;font-size:26px;font-weight:700">13 年</span>
      <span style="background:#dce9f2;color:#141b21;border-radius:999px;padding:14px 26px;font-size:26px;font-weight:700">40 张拍立得</span>
      <span style="background:#f3e7cf;color:#141b21;border-radius:999px;padding:14px 26px;font-size:26px;font-weight:700">9 个纹身</span>
    </div>
    <div class="onDark" style="position:absolute;top:${aHero.h + 550}px;left:64px">
      <div class="mono gold" style="font-size:26px">www.5guys1direction.asia</div>
    </div>
  `, { foot: '1 / 8', footColor: '#6f6a5f' }));

  /* 元素 01 */
  card('after-2-hero.png', page(`
    <div class="fill" style="background:#faf6ef;padding:64px 64px 0">
      <div class="eyebrow gold">元素 01 / 07</div>
      <div class="h1" style="margin-top:12px;font-size:70px">新的头图</div>
      <div style="margin-top:32px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(aHero)}</div>
      <div style="margin-top:34px">
        ${li('一进门就是他俩，黑白金调，很安静')}
        ${li('压着一句 <b>We don’t need a paper from the city hall...</b>')}
        ${li('「我们不需要市政厅的一纸证明」')}
      </div>
      <div class="calloutBot"><div class="callout gold">
        这套 9·28 的基调就写在这：<br>不是喊给别人听的，是承认给自己看的。
      </div></div>
    </div>
  `, { foot: '2 / 8' }));

  /* 元素 02 */
  card('after-3-leader.png', page(`
    <div class="fill" style="background:#faf6ef;padding:64px 64px 0">
      <div class="eyebrow gold">元素 02 / 07</div>
      <div class="h1" style="margin-top:12px;font-size:70px">十三周年主卡</div>
      <div style="margin-top:32px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(aLead)}</div>
      <div style="margin-top:34px">
        ${li('左格深蓝 = Louis，右格墨绿 = Harry')}
        ${li('这俩颜色来自他们话筒上的胶带，粉丝用了十几年')}
        ${li('那个巨大的 <b>13</b> 不是年份，是十三年')}
        ${li('底下那排六件信物：锚、罗盘、匕首、绳、玫瑰、帆船')}
      </div>
      <div class="calloutBot"><div class="callout blue">
        照片上露出三个纹身，全部是真的。<br>底下那六件信物，是从他们身上九处纹身里挑出来摆的。
      </div></div>
    </div>
  `, { foot: '3 / 8' }));

  /* 元素 03 */
  card('after-4-polaroid.png', page(`
    <div class="fill" style="background:#faf6ef;padding:64px 64px 0">
      <div class="eyebrow gold">元素 03 / 07</div>
      <div class="h1" style="margin-top:12px;font-size:70px">拍立得照片墙</div>
      <div style="margin-top:32px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(aPola)}</div>
      <div style="margin-top:32px">
        ${li('<b>40 张</b>照片，一张张裁成拍立得的白边')}
        ${li('边框蓝绿交错，相邻两张永远不同色')}
        ${li('每张底下一行手写题注：arms around / laughing / through glass')}
        ${li('箭头、键盘 ←→、滚轮、手机轻扫，四种翻法都行')}
      </div>
      <div class="calloutBot"><div class="callout dark">
        翻到第几张其实无所谓。<br>重点是这些照片真的被一张一张看过。
      </div></div>
    </div>
  `, { foot: '4 / 8' }));

  /* 元素 04 */
  card('after-5-fanart.png', page(`
    <div class="fill" style="background:#faf6ef;padding:64px 64px 0">
      <div class="eyebrow gold">元素 04 / 07</div>
      <div class="h1" style="margin-top:12px;font-size:70px">粉丝创作墙</div>
      <div style="margin-top:32px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(aFan)}</div>
      <div style="margin-top:32px">
        ${li('四格全是真人投稿，不是网上扒的图')}
        ${li('有手绘、有剪影、有照片，风格故意不统一')}
        ${li('每格都留了署名位，下面就是投稿邮箱')}
      </div>
      <div class="calloutBot"><div class="callout gold">
        这面墙永远留着空位。<br>你画了什么都可以发过来，下一格就是你的 🎨
      </div></div>
    </div>
  `, { foot: '5 / 8' }));

  /* 元素 05 */
  card('after-6-essay.png', page(`
    <div class="fill" style="background:#faf6ef;padding:64px 64px 0">
      <div class="eyebrow gold">元素 05 / 07</div>
      <div class="h1" style="margin-top:12px;font-size:70px">9·28 专稿</div>
      <div style="margin-top:32px;border:3px solid #141b21;border-radius:10px;overflow:hidden">${shot(a928)}</div>
      <div style="margin-top:34px">
        ${li('今年 9·28 的正式文章，中英双语全文')}
        ${li('封面我特意做了灰度，纪念日不是拿来热闹的')}
        ${li('正文里那几道金色分隔线，就只有这一篇有')}
      </div>
      <div class="calloutBot"><div class="callout blue">
        「有些日期属于历史。<br>而有些日期，属于人。」
      </div></div>
    </div>
  `, { foot: '6 / 8' }));

  /* 元素 06 · 手机端：真机整屏截图，两行各占剩余空间（绝不溢出） */
  const phone = (a, label, fs = 23) => `
    <div style="flex:1;display:flex;flex-direction:column;min-height:0">
      <div style="flex:1;min-height:0;border:11px solid #141b21;border-radius:38px;overflow:hidden;background:#141b21">
        <img src="${a.url}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top center">
      </div>
      <div style="font-size:${fs}px;color:#2f5d4e;margin-top:10px;text-align:center;font-weight:600;flex:0 0 auto">${label}</div>
    </div>`;

  card('after-7-mobile.png', page(`
    <div class="fill" style="background:#eef7f2;padding:56px 56px 90px;display:flex;flex-direction:column">
      <div class="eyebrow blue" style="flex:0 0 auto">元素 06 / 07</div>
      <div class="h1" style="margin-top:8px;font-size:60px;flex:0 0 auto">手机上也一样好看</div>
      <div class="lead" style="margin-top:10px;font-size:27px;flex:0 0 auto">下面四张都是 iPhone 竖屏整屏实拍，一张都没裁 ✌️</div>
      <div style="flex:1;min-height:0;display:flex;gap:28px;margin-top:22px">
        ${phone(mHero, '头图 · 390px')}
        ${phone(mPola, '照片墙 · 390px')}
        ${phone(mFan, '粉丝创作 · 390px')}
      </div>
      <div style="flex:1;min-height:0;display:flex;gap:34px;margin-top:24px">
        ${phone(m928, '专稿 · 390px')}
        <div style="flex:1.35;display:flex;flex-direction:column;gap:20px;justify-content:center">
          <div class="callout blue" style="font-size:28px;padding:28px 30px">照片墙在窄屏会变成<br>「一叠牌」，轻轻一划翻一张 👉</div>
          <div class="callout gold" style="font-size:28px;padding:28px 30px">头图不裁人，<br>那句 tagline 也不折行</div>
        </div>
      </div>
    </div>
  `, { foot: '7 / 8', footColor: '#2f5d4e' }));

  /* 元素 07 · 收尾 */
  card('after-8-end.png', page(`
    <div class="fill" style="background:#141b21;color:#faf6ef;padding:72px 64px">
      <div class="eyebrow gold">元素 07 / 07</div>
      <div class="serif" style="font-size:74px;line-height:1.12;font-weight:700;margin-top:20px">We don’t need<br>a paper from<br>the city hall.</div>
      <div class="song gold" style="font-size:38px;line-height:1.4;margin-top:22px">我们不需要市政厅的一纸证明。</div>
      <div style="width:88px;height:4px;background:#c9a86a;margin:36px 0 30px"></div>
      <div style="font-size:30px;line-height:1.8;color:#d8d2c4">
        十三年里，官方没给过任何说法<br>
        所以这些日子、这些照片、这些约定<br>
        一直是粉丝自己在记，自己往下传<br><br>
        这个站做的也是同一件事：<br>
        <b style="color:#fff">把散在各处的碎片，重新摆回同一个页面上</b>
      </div>
      <div style="position:absolute;left:64px;right:64px;bottom:72px">
        <div class="callout" style="background:#1e4d6e;color:#fff;font-size:30px">
          9 月 28 日之后，首页就是这一套<br>以后每年这天，它都会在那儿等你 🕐
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px">
          <div>
            <div class="serif" style="font-size:40px;line-height:1.1">FIVE GUYS<br>ONE DIRECTION</div>
            <div class="mono gold" style="font-size:23px;margin-top:12px">www.5guys1direction.asia</div>
          </div>
          <div style="width:124px;height:124px;border:3px solid #c9a86a;border-radius:50%;display:flex;align-items:center;justify-content:center">
            <span class="serif" style="font-size:40px;color:#c9a86a">9.28</span>
          </div>
        </div>
      </div>
    </div>
  `, { noFoot: true }));

  /* ================= 渲染 ================= */
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  for (const c of cards) {
    const f = path.join(TMP, c.file.replace('.png', '.html'));
    fs.writeFileSync(f, c.html);
    await p.goto('file://' + f, { waitUntil: 'load' });
    try { await Promise.race([p.evaluate(() => document.fonts.ready), p.waitForTimeout(6000)]); } catch (e) {}
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(OUT, c.file), timeout: 15000 });
    console.log('✓', c.file);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.stack); process.exit(1); });

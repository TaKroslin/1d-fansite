"""
One-off: combine zayn1.jpg (500x500) + zayn2.jpg (417x417)
into a single 500x1000 vertical filmstrip matching the
existing filmstrip-{louis,harry,liam,niall}-smlc4ca.jpg style.

Output: images/gfx/filmstrip-zayn-smlc4ca.jpg
"""
from PIL import Image
from pathlib import Path

ROOT = Path(r"E:\文档\GitHub\1d-fansite")
Z1 = ROOT / "zayn1_input.jpg"  # temp
Z2 = ROOT / "zayn2_input.jpg"  # temp
OUT = ROOT / "images" / "gfx" / "filmstrip-zayn-smlc4ca.jpg"

# Use the actual input paths from the user's attachments
Z1 = Path(r"C:\Users\Tachibana Kousuke\.minimax\v2\assets\2026\07\28\20-48-35-742-asset_20260728-204835-742_f77a41cedb87_06cc2c8e-zayn1.jpg")
Z2 = Path(r"C:\Users\Tachibana Kousuke\.minimax\v2\assets\2026\07\28\20-48-35-679-asset_20260728-204835-679_bcfb68ebcfc3_11401c3c-zayn2.jpg")

# Target canvas: 500 wide x 1000 tall (vertical strip).
# Each frame occupies 500x500. Crop to square then resize.
TARGET_W = 500
FRAME_H = 500
CANVAS_H = FRAME_H * 2

canvas = Image.new("RGB", (TARGET_W, CANVAS_H), (0, 0, 0))

for idx, src in enumerate([Z1, Z2]):
    img = Image.open(src).convert("RGB")
    w, h = img.size
    # Center-crop to square (use the smaller side as the crop)
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    # Resize to 500x500
    img = img.resize((TARGET_W, FRAME_H), Image.LANCZOS)
    # Paste at top or bottom
    canvas.paste(img, (0, idx * FRAME_H))

# Save with reasonable JPEG quality
OUT.parent.mkdir(parents=True, exist_ok=True)
canvas.save(OUT, "JPEG", quality=82, optimize=True, progressive=True)
print(f"Wrote {OUT} ({canvas.size[0]}x{canvas.size[1]})")

#!/usr/bin/env python3
"""Paruošia nuotraukas iš originalios sivysta.lt (atsiųstos į SRC) -> assets/img.
Naudojimas: python3 tools/media.py <src_dir> <media_dir>
"""
import json, pathlib, sys, shutil
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = pathlib.Path(sys.argv[1]); MEDIA = pathlib.Path(sys.argv[2])
OUT = ROOT / "assets/img/projects"; OUT.mkdir(parents=True, exist_ok=True)
PH = ROOT / "assets/img/photos"; PH.mkdir(parents=True, exist_ok=True)

def save(src, dst, maxw=1600, q=78):
    im = Image.open(src); im = ImageOps.exif_transpose(im).convert("RGB")
    w, h = im.size
    if max(w, h) > maxw:
        s = maxw / max(w, h); im = im.resize((round(w*s), round(h*s)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
    return im.size

data = json.load(open(ROOT / "_data/projects.json", encoding="utf-8"))
manifest = {}
for group in ("done", "ongoing"):
    for p in data[group]:
        files = []
        for i, name in enumerate(p["src"]):
            src = SRC / name
            if not src.exists(): print("TRŪKSTA", name); continue
            dst = OUT / (p["slug"] + ("" if i == 0 else f"-{i+1}") + ".jpg")
            size = save(src, dst)
            files.append({"file": dst.name, "w": size[0], "h": size[1]})
        manifest[p["slug"]] = files
json.dump(manifest, open(ROOT / "_data/images.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

photos = {
  "hero-poster.jpg": ("Paneriu49_22-scaled.jpg", 2000),
  "projektai-vykdomi.jpg": ("01-2-Copy.jpg", 1800),
  "projektai-igyvendinti.jpg": ("2_1_1.jpg", 1400),
  "render-terasa.jpg": ("2-vykd.png", 1800),
  "render-biurai.jpg": ("3-vykd.png", 1800),
  "render-sandelis.jpg": ("004-2024-10-14.png", 1800),
  "mokykla-aerial.jpg": ("1-igyvend.png", 1800),
  "senamiestis.jpg": ("3-igyvend.png", 1800),
  "british-school.jpg": ("2-igyvend.png", 1800),
  "skuba.jpg": ("Untitled-4.png", 1400),
  "klinika.jpg": ("gydymo.png", 1400),
  "vu-kiemas.jpg": ("kulturos.png", 1400),
  "paveldas-kiemas.jpg": ("kultura.png", 1400),
  "sandelis.jpg": ("pramoniniai.png", 1400),
}
for dst, (src, mw) in photos.items():
    print(dst, save(MEDIA / src, PH / dst, mw, 80))

# logotipas: baltas PNG apkerpamas; tamsus variantas (baltos dalys -> grafitas)
lg = Image.open(MEDIA / "cropped-sivysta-logo-naujas-baltas.png").convert("RGBA")
bbox = lg.getbbox(); lg = lg.crop(bbox)
lg.save(ROOT / "assets/img/logo/logo-white.png", optimize=True)
px = lg.load(); dark = lg.copy(); dp = dark.load()
for y in range(lg.size[1]):
    for x in range(lg.size[0]):
        r, g, b, a = px[x, y]
        if a and r > 200 and g > 200 and b > 200:  # baltas tekstas -> grafitas
            dp[x, y] = (21, 24, 27, a)
dark.save(ROOT / "assets/img/logo/logo-dark.png", optimize=True)
print("logo", lg.size)
shutil.copy(MEDIA / "hero.mp4", ROOT / "assets/video/hero.mp4")
for f in (MEDIA / "docs").glob("*.pdf"): shutil.copy(f, ROOT / "assets/docs" / f.name)
print("OK")

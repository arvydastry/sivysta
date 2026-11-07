#!/usr/bin/env python3
"""Supjausto aukštą PNG į peržiūrai patogias dalis: python3 _tools/split.py <failas.png> [aukštis]"""
import sys, pathlib
from PIL import Image
p = pathlib.Path(sys.argv[1]); step = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
im = Image.open(p); w, h = im.size; n = 0
for y in range(0, h, step):
    c = im.crop((0, y, w, min(h, y + step))); c.thumbnail((1400, 1400))
    c.convert('RGB').save(p.with_name(f"{p.stem}-p{n}.jpg"), quality=72); n += 1
print(p.name, w, h, 'dalių:', n)

#!/usr/bin/env python3
"""Meniu (antraštės) pasiūlymų peržiūra. Paima surinktą puslapį (numatyta index.html), pakeičia
<header class="site-header" ...>...</header> failu _proposals/menu-<raktas>/header.html ir prijungia
_proposals/menu-<raktas>/style.css (+ script.js, jei yra). Rezultatas: proposal-menu-<raktas>[-<puslapis>].html
Naudojimas: python3 tools/proposal_menu.py <raktas> [puslapis.html]
"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
key = sys.argv[1]; src = sys.argv[2] if len(sys.argv) > 2 else "index.html"
d = ROOT / "_proposals" / f"menu-{key}"
page = (ROOT / src).read_text(encoding="utf-8")
hdr = (d / "header.html").read_text(encoding="utf-8").strip()
page, n = re.subn(r'<header class="site-header".*?</header>', lambda m: hdr, page, count=1, flags=re.S)
assert n == 1, "header not found"
page = page.replace("</head>", f'<link rel="stylesheet" href="_proposals/menu-{key}/style.css">\n</head>', 1)
if (d / "script.js").exists():
    page = page.replace("</body>", f'<script src="_proposals/menu-{key}/script.js" defer></script>\n</body>', 1)
name = f"proposal-menu-{key}" + ("" if src == "index.html" else "-" + pathlib.Path(src).stem) + ".html"
(ROOT / name).write_text(page, encoding="utf-8")
print(name)

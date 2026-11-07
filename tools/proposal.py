#!/usr/bin/env python3
"""Pasiūlymų peržiūra: pakeičia pradžios puslapio įžangos sekciją (tarp <!-- Įžanga ir <!-- Paslaugos)
failu _proposals/<raktas>/section.html ir prijungia _proposals/<raktas>/style.css (+ script.js, jei yra).
Rezultatas: proposal-<raktas>.html projekto šaknyje (tie patys santykiniai keliai kaip index.html).
Naudojimas: python3 tools/proposal.py <raktas>
"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
key = sys.argv[1]
d = ROOT / "_proposals" / key
page = (ROOT / "index.html").read_text(encoding="utf-8")
sec = (d / "section.html").read_text(encoding="utf-8")
a = page.index("<!-- Įžanga:"); b = page.index("<!-- Paslaugos:")
page = page[:a] + sec.strip() + "\n\n" + page[b:]
links = f'<link rel="stylesheet" href="_proposals/{key}/style.css">'
page = page.replace("</head>", links + "\n</head>", 1)
if (d / "script.js").exists():
    page = page.replace("</body>", f'<script src="_proposals/{key}/script.js" defer></script>\n</body>', 1)
out = ROOT / f"proposal-{key}.html"
out.write_text(page, encoding="utf-8")
print(out.name)

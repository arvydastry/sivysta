#!/usr/bin/env python3
"""SiVySta maketas: surenka puslapius iš _parts/ + _body/ ir _data/projects.json.

Naudojimas:  python3 build.py
Kiekvieno _body failo PIRMOJI eilutė yra meta komentaras su JSON:
<!--meta {"title": "...", "description": "...", "nav": "paslaugos", "body_class": "page-x", "header": "transparent|solid", "og_image": "assets/img/photos/x.jpg"} -->

Žymės (galioja _parts ir _body failuose):
  {{root}}                 kelias iki projekto šaknies (visada "" – vienas lygis)
  {{title}} {{description}} {{body_class}} {{header_mode}} {{og_image}} {{year}}
  {{nav:raktas}}           " is-active", jei puslapio meta "nav" == raktas
  {{projects:done}}        visų įgyvendintų projektų kortelės (su data-cat filtrui)
  {{projects:ongoing}}     vykdomų projektų kortelės
  {{projects:home}}        6 išskirtiniai projektai pradžiai
  {{projects:cat=raktas}}  iki 3 kategorijos projektų (paslaugų puslapiams)
  {{projects:marquee}}     vykdomų projektų adresų juosta
  {{include:vardas}}       _parts/vardas.html
"""
import datetime, html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
PARTS, BODY, DATA = ROOT / "_parts", ROOT / "_body", ROOT / "_data"
META_RE = re.compile(r"^\s*<!--meta\s+(\{.*?\})\s*-->\s*\n?", re.S)
TOKEN_RE = re.compile(r"\{\{\s*([a-z_]+)(?::([\w=\-]+))?\s*\}\}")

PROJECTS = json.load(open(DATA / "projects.json", encoding="utf-8"))
IMAGES = json.load(open(DATA / "images.json", encoding="utf-8")) if (DATA / "images.json").exists() else {}
CATS = {c["key"]: c for c in PROJECTS["categories"]}
HOME_FEATURED = ["nugaletoju-34", "tiskeviciaus-rumai", "british-school", "vilniaus-37", "tilzes-86-klaipeda"]


def esc(s): return html.escape(s, quote=True)


def card(p, kind="done"):
    imgs = IMAGES.get(p["slug"], [])
    cat = CATS[p["cat"]]["label"]
    label = "Vykdomas" if kind == "ongoing" else cat
    if imgs:
        first = imgs[0]
        gallery = " ".join(f'data-gallery-{i}="assets/img/projects/{im["file"]}"' for i, im in enumerate(imgs))
        return (
            f'<article class="pcard" data-cat="{p["cat"]}" data-reveal>\n'
            f'  <a class="pcard__media" href="assets/img/projects/{first["file"]}" data-lightbox="{esc(p["title"])}, {esc(p["place"])}" {gallery}>\n'
            f'    <img src="assets/img/projects/{first["file"]}" alt="{esc(p["title"])}, {esc(p["place"])}" width="{first["w"]}" height="{first["h"]}" loading="lazy" decoding="async">\n'
            f'    <span class="pcard__zoom" aria-hidden="true"><svg class="i"><use href="#i-expand"/></svg></span>\n'
            f'  </a>\n'
            f'  <div class="pcard__body">\n'
            f'    <span class="tag tag--line">{esc(label)}</span>\n'
            f'    <h3 class="pcard__title">{esc(p["title"])}</h3>\n'
            f'    <p class="pcard__place"><svg class="i" aria-hidden="true"><use href="#i-pin"/></svg>{esc(p["place"])}</p>\n'
            + (f'    <p class="pcard__credit">{esc(p["credit"])}</p>\n' if p.get("credit") else "")
            + f'  </div>\n</article>'
        )
    return (
        f'<article class="pcard pcard--text" data-cat="{p["cat"]}" data-reveal>\n'
        f'  <div class="pcard__body">\n'
        f'    <span class="tag tag--line">{esc(label)}</span>\n'
        f'    <h3 class="pcard__title">{esc(p["title"])}</h3>\n'
        f'    <p class="pcard__place"><svg class="i" aria-hidden="true"><use href="#i-pin"/></svg>{esc(p["place"])}</p>\n'
        f'  </div>\n</article>'
    )


def projects(arg):
    if arg == "done":
        return "\n".join(card(p) for p in PROJECTS["done"])
    if arg == "ongoing":
        withimg = [p for p in PROJECTS["ongoing"] if IMAGES.get(p["slug"])]
        noimg = [p for p in PROJECTS["ongoing"] if not IMAGES.get(p["slug"])]
        return "\n".join(card(p, "ongoing") for p in withimg + noimg)
    if arg == "home":
        bys = {p["slug"]: p for p in PROJECTS["done"]}
        return "\n".join(card(bys[s]) for s in HOME_FEATURED)
    if arg == "marquee":
        items = [f'<span class="marquee__item"><b>{esc(p["title"])}</b> {esc(p["place"])}</span>' for p in PROJECTS["ongoing"]]
        return "\n".join(items)
    if arg.startswith("cat="):
        key = arg[4:]
        items = [p for p in PROJECTS["done"] if p["cat"] == key and IMAGES.get(p["slug"])][:3]
        return "\n".join(card(p) for p in items)
    raise KeyError(arg)


def part(name):
    p = PARTS / f"{name}.html"
    return p.read_text(encoding="utf-8")


def render(text, ctx, nav):
    def sub(m):
        key, arg = m.group(1), m.group(2)
        if key == "nav":
            return " is-active" if arg == nav else ""
        if key == "projects":
            return projects(arg)
        if key == "include":
            return part(arg)
        return str(ctx[key]) if key in ctx else m.group(0)
    return TOKEN_RE.sub(sub, text)


def build_page(src):
    raw = src.read_text(encoding="utf-8")
    m = META_RE.match(raw)
    meta = json.loads(m.group(1)) if m else {}
    body = raw[m.end():] if m else raw
    ctx = {
        "root": "",
        "title": meta.get("title", "SiVySta"),
        "description": meta.get("description", ""),
        "body_class": meta.get("body_class", ""),
        "header_mode": meta.get("header", "transparent"),
        "og_image": meta.get("og_image", "assets/img/photos/hero-poster.jpg"),
        "year": datetime.date.today().year,
    }
    nav = meta.get("nav", "")
    page = "".join([part("head"), part("header"), '<main id="turinys">\n', body, "\n</main>\n", part("footer"), part("scripts")])
    page = render(render(page, ctx, nav), ctx, nav)
    out = ROOT / src.name
    out.write_text(page, encoding="utf-8")
    return out, page


def check(out, page):
    problems = [f"nepakeista žymė {t}" for t in set(re.findall(r"\{\{[^}]*\}\}", page))]
    for href in set(re.findall(r'(?:href|src|poster|data-bg|data-gallery-\d+)="([^"#?]+)', page)):
        if not href or re.match(r"^(https?:|mailto:|tel:|data:|javascript:)", href):
            continue
        if not (out.parent / href).exists():
            problems.append(f"nėra failo: {href}")
    return problems


def main():
    built = issues = 0
    for src in sorted(BODY.glob("*.html")):
        out, page = build_page(src)
        probs = check(out, page)
        built += 1; issues += len(probs)
        print(f"  ✓ {out.name}" + ("" if not probs else "  ⚠ " + "; ".join(sorted(probs)[:8])))
    print(f"Surinkta puslapių: {built}, įspėjimų: {issues}")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())

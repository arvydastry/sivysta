# SiVySta – naujos sivysta.lt versijos demo maketas

**Kas tai:** statinis HTML demo kliento pristatymui (UAB „SiVySta“, statybos ir generalinės rangos įmonė, Vilnius). Moderni dabartinės
[sivysta.lt](https://www.sivysta.lt/) versija, sukurta **Salient būdu**: kiekvienas blokas turi natyvų WordPress + Salient (WPBakery)
atitikmenį, todėl galutinė svetainė perkeliama į Salient be papildomo programavimo. Naudotas **esamas svetainės turinys, nuotraukos ir video**.

Dizaino kryptis: solidi, pasitikėjimą kelianti įmonė su ilgalaike patirtimi (nuo 2002 m.) ir dideliais projektais. Grafitas + šiltas
šviesus fonas, oranžinė iš logotipo tik akcentams, didelės antraštės (Manrope), daug tikrų objektų nuotraukų, ramus judesys.

## Kaip peržiūrėti

- **Gyvai:** <https://arvydastry.github.io/sivysta/> (GitHub Pages iš `main` šakos, saugykla <https://github.com/arvydastry/sivysta>; `noindex`, paieškos sistemos neindeksuoja).
  Atnaujinimas: `python3 build.py` (0 įspėjimų), tada `git commit` ir `git push`; Pages persirenka per ~1 min.
- Vietinis serveris: `python3 tools/serve.py` ir atidaryti <http://localhost:8141/> (tas pats nustatyta `.claude/launch.json`). Serveris palaiko HTTP Range, be jo `<video>` klipai naršyklėje nepersuka ir nesikartoja (`python3 -m http.server` netinka).
- Veikia ir atidarius `index.html` tiesiai iš `file://` (šriftai iš Google Fonts, be interneto bus sisteminis šriftas).
- Viršuje tamsi „Demo maketas“ juosta su nuorodomis į visus puslapius (į WordPress neperkeliama).
- Visi puslapiai turi `noindex, nofollow`. Formos niekur nesiunčia duomenų (rodomas sėkmės pranešimas).

## Puslapiai (15)

| Puslapis | Failas | Sekcijos |
|---|---|---|
| Pradžia | `index.html` | Video hero (originalus sivysta.lt video) + skaičių juosta · Įžanga: miestų eilutė, antraštė su įterptu video, slenkant išsiplečianti video scena su skaičiais-nuorodomis (48+, 12) ir 4 faktai „Kodėl mumis pasitiki“ · 6 paslaugų kortelės (numeriai vietoje ikonų, 6-oji su video) · „Kodėl SiVySta“ juosta su video fonu · 5 išskirtiniai projektai · Lipnus 4 žingsnių procesas su video kiekvienam žingsniui · Vykdomų projektų judanti juosta · Sertifikatai (eilutės) + karjera · CTA su video fonu |
| Apie mus | `apie-mus.html` | Hero · Istorija + laiko juosta · 4 vertybių blokai (originalus tekstas) · Citata + kryptys |
| Paslaugos | `paslaugos.html` | Hero · 6 kortelės · Generalinė ranga (tamsi sekcija) · 6 proceso etapai |
| 5 paslaugų puslapiai | `gyvenamuju-…`, `komerciniu-…`, `kulturos-paveldo-…`, `viesosios-paskirties-…`, `gamybiniu-pastatu-statyba.html` | Hero · originalus aprašymas + lipni užklausos kortelė · etapai · 3 susiję projektai · kitos paslaugos. Paveldo puslapis – 7 etapų toggles + nauda |
| Projektai | `projektai.html` | Hero · 2 dideli blokai (vykdomi / įgyvendinti) · 6 kategorijų plytelės |
| Vykdomi projektai | `vykdomi-projektai.html` | 12 projektų kortelės (3 su nuotraukomis, 9 tekstinės) |
| Įgyvendinti projektai | `igyvendinti-projektai.html` | Filtras pagal 6 kategorijas (`?kat=gyvenamieji` ir kt.) · 48 projektų kortelės · galerija (lightbox) |
| Sertifikatai | `sertifikatai.html` | ISO 9001 / 14001 / 45001, kvalifikacijos atestatas, Gazelė 2016 + originalūs PDF |
| Karjera | `karjera.html` | 3 skelbimai (toggles) · CV anketa |
| Kontaktai | `kontaktai.html` | 4 kontaktų kortelės · užklausos forma (`?domina=…` parenka paslaugą) · žemėlapis · rekvizitai |
| Privatumo politika | `privatumo-politika.html` | Pavyzdinis tekstas (klientas pateiks galutinį) |

## Failai

| Kelias | Paskirtis |
|---|---|
| `build.py` | Surenka puslapius iš `_parts/` + `_body/` + `_data/projects.json`; tikrina žymes ir nuorodas. Paleisti po kiekvieno pakeitimo: `python3 build.py` (turi rodyti 0 įspėjimų) |
| `_parts/` | `head`, `header` (ikonų sprite, demo juosta, antraštė su mega meniu „Paslaugos“ / „Projektai“, mobilus meniu), `footer` (CTA, poraštė, slapukai, lightbox, toast), `scripts` |
| `_body/*.html` | Kiekvieno puslapio turinys; 1 eilutė – meta JSON (title, description, nav, body_class, header, og_image) |
| `_data/projects.json` | Visi projektai (kategorija, pavadinimas, vieta, nuotraukų šaltiniai). Kortelės generuojamos žymėmis `{{projects:done}}`, `{{projects:ongoing}}`, `{{projects:home}}`, `{{projects:cat=raktas}}`, `{{projects:marquee}}` |
| `_data/images.json` | Sugeneruotas nuotraukų manifestas (`tools/media.py`) |
| `tools/media.py` | Apdoroja originalias sivysta.lt nuotraukas (dydis iki 1600 px, JPEG), logotipą, video, PDF |
| `assets/css/style.css` | Dizaino sistema: žetonai, komponentai, judesys (~990 eil.) |
| `assets/js/main.js` | Antraštė, mega meniu (mygtukas su aria-expanded, pelės delsa, Escape ir rodyklių klavišai, liečiamas ekranas, video tik atidarius, kategorijų nuotraukų peržiūra), mobilus meniu, reveal / split / mask / parallax / tilt, skaitikliai, lipnus procesas (video groja tik matomas), filtras, lightbox, formos, slapukai, video autoplay pagal matomumą (Data Saver, vartotojo pauzė), įžangos video scenos išplėtimas slenkant, pauzės mygtukai |
| `assets/img/projects/` | 88 projektų nuotraukos iš sivysta.lt (`<slug>.jpg`, `<slug>-2.jpg`) |
| `assets/img/photos/` | Hero ir kategorijų nuotraukos iš sivysta.lt |
| `assets/video/hero.mp4` | Originalus pradinio puslapio fono video (18 MB, nesuspaustas) |
| `assets/video/*.mp4`, `assets/video/posters/` | 7 papildomi statybų klipai iš Mixkit (720p, nemokama Mixkit Stock Video licencija, komerciniam naudojimui tinka, kreditai žemiau) ir jų poster kadrai |
| `tools/serve.py` | Vietinis serveris su HTTP Range palaikymu |
| `tools/proposal_menu.py` | Antraštės (meniu) variantų peržiūra: pakeičia `<header>` failu `_proposals/menu-<raktas>/header.html` |
| `tools/proposal.py` | Dizaino krypčių peržiūra: pakeičia pradžios įžangą failu `_proposals/<raktas>/section.html` (+ `style.css`, `script.js`) ir sukuria `proposal-<raktas>.html` |
| `assets/docs/` | ISO sertifikatai (LT/EN) ir kvalifikacijos atestatas (PDF iš sivysta.lt) |
| `_tools/shot.mjs`, `_tools/split.py` | Ekrano nuotraukos per Chrome CDP ir jų skaidymas peržiūrai |

## Dizaino sistema

| Spalva | HEX | Naudojimas |
|---|---|---|
| Ink / Ink-2 | `#15181B` / `#1F2429` | Tamsios sekcijos, antraštė, poraštė, tekstas |
| Paper | `#F6F5F2` | Pagrindinis fonas |
| Sand / Line | `#ECE9E2` / `#DAD6CE` | Alternatyvios sekcijos, rėmeliai |
| Orange | `#F08A00` | Prekės ženklo akcentas (iš logotipo): mygtukai, eyebrow, akcentinis žodis |
| Orange deep / light | `#B86800` / `#FFB043` | Oranžinis tekstas šviesiame / tamsiame fone (kontrastas) |

- Šriftai: antraštės **Manrope** 800, tekstas **Inter** 400/500 (Google Fonts, abu su LT diakritikais).
- Formos: konteineris 1240 px, kortelės 20 px kampai, mygtukai piliulės, „įlaipintos“ tamsios sekcijos (`.section--inset`).
- Judesys: žodžių mask reveal antraštėms, reveal su stagger, nuotraukų clip-path reveal, parallax hero fonams, 3D tilt paslaugų kortelėms,
  skaitikliai, lipni medija procesui, judanti juosta, slenkant išsiplečianti įžangos video scena (tik ≥ 901 px, ne su `prefers-reduced-motion`), video „piliulė“ antraštėje. Animuojami tik transform / opacity / clip-path / filter. `prefers-reduced-motion`
  gerbiamas (viskas matoma, video sustabdytas). Be JS turinys irgi matomas.

## Salient atitikmenys

| Maketo blokas | Salient elementas |
|---|---|
| Mega meniu „Paslaugos“ ir „Projektai“ | Header Navigation → Dropdown/Megamenu: Mega Menu Width Contained, Animation Fade In Up, Roundness 20, Shadow Large, Megamenu Removes Transparent Header, Display descriptions; „Paslaugos“ = Mega Menu Global Section (Row, 3 Columns: Text + Milestone, nuorodų sąrašas, video su Column Link); „Projektai“ = meniu punktai su Media (Video/Image, Behind Text, Zoom In Slow) ir Labels (skaičiai). Ne natyvu: atskiras rodyklės mygtukas, pelės delsa, klaviatūra, kategorijų nuotraukų keitimas, pritemdymas, juostos sutankinimas 1181–1365 px (detaliau `_parts/header.html` komentare) |
| Video hero | Row + Self Hosted Video background, Animated Text (Split Line), Button |
| Skaičiai | Milestone |
| Paslaugų kortelės | Fancy Box – Parallax Hover (Column su hover ir backdrop blur) |
| Projektų kortelės ir filtras | Post Loop Builder (CPT „Projektai“) arba Salient Portfolio su kategorijomis |
| Lipnus procesas | Sticky Content Sections – Sticky Media, Scrolling Content |
| Judanti juosta | Scrolling Text |
| Vertybių / privalumų blokai | Icon Box, Fancy Unordered List |
| Toggles (etapai, skelbimai) | Toggle Panels |
| Laiko juosta | Nectar Icon List (vertical) |
| Įžangos video scena | Row Full Width Background + Video BG, Background Layer Animation: Clip Path Inset (Scroll Position), Disable on Mobile; pradžios įtrauka pagal įrenginį (≈100px @1440) |
| Įžangos linijos ir faktai | Divider (Full Width, 1px, Animate Line) + Inner Row 4 Columns, Column Animation Slight Fade In From Bottom |
| Video pauzės mygtukai (hero, įžangos scena) | Ne natyvus: Raw HTML mygtukas + Theme Options → Custom JS (`data-video-toggle`, WCAG 2.2.2). WP'e selektorius `#<Row ID> .nectar-video-wrap video` |
| Antraštė su įterptu video | Text With Inline Media (Media Type: Videos) |
| Nuotraukų reveal | Image with Mask Reveal animation |
| Galerija | Image Gallery lightbox |
| Žemėlapis | Interactive Map |

## Video klipai (Mixkit)

| Failas | Mixkit klipas | Kur naudojamas |
|---|---|---|
| `architects.mp4` | Architects checking a blueprint on a building (21230) | Paslaugų 06 kortelė, proceso 01 žingsnis, mega meniu „Paslaugos“ kortelė |
| `blueprint.mp4` | Men on construction site checking the blueprint (23511) | Proceso 02 žingsnis, viešosios paskirties puslapis |
| `steel-frames.mp4` | Building frames in a construction site (25480) | „Kodėl SiVySta“ juosta, komercinių pastatų puslapis |
| `concrete.mp4` | Working with concrete (14729) | Proceso 03 žingsnis, gyvenamųjų pastatų puslapis |
| `builders.mp4` | Builders working at the construction site (31473) | Proceso 04 žingsnis, „Apie mus“, mega meniu „Projektai“ kortelė „Vykdomi“ |
| `aerial-site.mp4` | Construction zone in a city in an aerial shot (42333) | Įžangos išsiplečianti scena, paslaugų puslapio generalinės rangos kortelė, gamybinių pastatų puslapis |
| `sunset-site.mp4` | Sunset behind a building under construction (3971) | Poraštės CTA fonas |
| `pill-concrete.mp4` | `concrete.mp4` ištrauka (2–7 s), perkoduota `avconvert` PresetMediumQuality, 568×320, 460 KB | Įžangos antraštės „piliulė“ (visuose ekranuose) |

Klipai rodomi tik kai matomi ekrane (`data-autoplay`); `prefers-reduced-motion` ir „Data Saver“ režimuose stovi poster kadrai (960×540, `assets/video/posters/`). Vartotojo sustabdytas video (`data-video-toggle`) automatiškai nebepaleidžiamas. Pilnoje svetainėje rekomenduojama pakeisti klientų objektų dronų filmuota medžiaga.

## Ką reikia patvirtinti su klientu

- **Skaičiai.** Dabartinėje svetainėje rodomi „512+ projektų, 1120+ valdomų projektų, 1520+ specialistų“ atrodo kaip šablono vietos
  rezervavimas, todėl makete naudoti tik pagrindžiami faktai: 2002 m. įkūrimas, 20+ metų, 48+ įgyvendinti ir 12 vykdomų projektų
  (pagal svetainėje skelbiamus sąrašus), 3 ISO standartai. Klientas gali pateikti tikslius skaičius.
- **Paslaugų aprašymai pradžioje.** Dabartinėje svetainėje vietoje jų – „Lorem ipsum“ ir „Trumpas tekstas“; makete parašyti trumpi
  aprašymai pagal paslaugų puslapių turinį.
- **Nuotraukos.** 12 projektų (9 vykdomi ir 3 įgyvendinti) svetainėje nuotraukų neturi, rodomos tekstinės kortelės. Dalis senų
  nuotraukų mažos raiškos (iki 600 px). Kelios nuotraukos su autorių ženklais (Norbert Tukaj, Andrius Laucius) – kreditai nurodyti kortelėse.
- **Video.** Hero video – originalus failas (18 MB); produkcijai verta suspausti iki ~5 MB ir pridėti WebM. Kiti klipai – Mixkit stock medžiaga (laikina, kol klientas pateiks savo objektų video). Įžangos scenos klipas yra 720p, todėl dideliuose ekranuose šiek tiek minkštas: pilnoje svetainėje reikėtų 1080p kliento dronų medžiagos.
- **Skaičiai 48+ ir 12** įžangoje suskaičiuoti iš svetainės projektų sąrašų (48 įgyvendinti Lietuvoje, Belgijoje, Estijoje; 12 vykdomų Vilniuje ir Alytuje), juos patvirtina klientas.
- **Privatumo politika** – pavyzdinis tekstas. **EN versija** – demo nedaryta (jungiklis rodo pranešimą).
- Socialinių tinklų nuorodos poraštėje – nėra duomenų.

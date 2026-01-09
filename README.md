# Lõputöö Generaator

VIKK (Viljandi Kutseõppekeskus) formaadis lõputöö generaator Pandoc ja LaTeX abil. Kirjuta oma lõputöö Markdownis, genereeri PDF ja DOCX automaatselt.

## Omadused

- **Markdown → PDF/DOCX** - Kirjuta lihtsas Markdown formaadis
- **VIKK formaat** - Vastab kooli vorminõuetele (Times New Roman, veerised, reavahe)
- **Automaatne sisukord** - Genereeritakse automaatselt
- **Viited ja bibliograafia** - BibTeX tugi, autor-aasta viitamisstiil
- **Ristiviited** - Viita peatükkidele, joonistele ja tabelitele
- **Koodiplokkide süntaksi esiletõstmine** - Toetab kõiki levinumaid keeli

## Eeltingimused

Paigalda järgmised tööriistad:

### macOS

```bash
# Homebrew abil
brew install pandoc
brew install pandoc-crossref
brew install --cask mactex  # või basictex väiksema versiooni jaoks
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install pandoc pandoc-citeproc texlive-xetex texlive-fonts-recommended
# pandoc-crossref tuleb paigaldada eraldi: https://github.com/lierdakil/pandoc-crossref/releases
```

### Windows

1. Paigalda [Pandoc](https://pandoc.org/installing.html)
2. Paigalda [MiKTeX](https://miktex.org/download)
3. Paigalda [pandoc-crossref](https://github.com/lierdakil/pandoc-crossref/releases)

## Integreerimine oma projekti

### Variant 1: Kopeerimine (soovitatav)

Kopeeri see kaust oma projekti kausta:

```bash
# Klooni see repo
git clone https://github.com/henno/loputoo-generaator.git

# Kopeeri oma projekti
cp -r loputoo-generaator my-project/docs/loputoo
```

### Variant 2: Git submodule

```bash
cd my-project
git submodule add https://github.com/henno/loputoo-generaator.git docs/loputoo
```

### Variant 3: Eraldi kaust

Hoia lõputöö eraldi kaustana oma projekti kõrval:

```
my-project/
├── src/
├── tests/
└── README.md

my-project-thesis/        # See repo
├── loputoo.md
├── meta.yaml
└── ...
```

## Kasutamine

### 1. Seadista metaandmed

Muuda `meta.yaml` failis oma lõputöö andmed:

```yaml
title: "Minu lõputöö pealkiri"
author: "Minu Nimi"
program: "Noorem tarkvaraarendaja"
advisor: "Juhendaja Nimi"
year: "2026"
```

### 2. Kirjuta lõputöö

Muuda `loputoo.md` faili. Kasuta näidisfaili mallina.

### 3. Lisa allikad

Lisa kasutatud allikad `kirjandus.bib` faili BibTeX formaadis.

### 4. Genereeri PDF ja DOCX

```bash
# macOS/Linux
./build.sh

# Windows PowerShell
./build.ps1
```

Väljundfailid:
- `loputoo.pdf` - PDF versioon
- `loputoo.docx` - Word versioon

## Kausta struktuur

```
loputoo-generaator/
├── loputoo.md           # ← SINU LÕPUTÖÖ SISU
├── meta.yaml            # ← SINU METAANDMED
├── kirjandus.bib        # ← SINU ALLIKAD
├── images/              # ← SINU PILDID
│   └── .gitkeep
├── template.tex         # LaTeX mall (tavaliselt ei muuda)
├── style.csl            # Viitamisstiil (tavaliselt ei muuda)
├── filters/
│   └── vikk-structure.lua
├── build.sh             # Ehitusskript (macOS/Linux)
├── build.ps1            # Ehitusskript (Windows)
└── README.md
```

## Markdown süntaks

### Pealkirjad

```markdown
# Peatükk {#sec:label}           <!-- 1. Peatükk -->
## Alapeatükk                     <!-- 1.1 Alapeatükk -->
### Alampeatükk                   <!-- 1.1.1 Alampeatükk -->
```

Nummerdamata peatükid (sissejuhatus, kokkuvõte):

```markdown
# Sissejuhatus {#sec:sissejuhatus}
# Kokkuvõte {#sec:kokkuvote}
# Summary {.unnumbered}
```

### Viitamine allikatele

```markdown
Üks allikas: [@raamat2024]
Mitu allikat: [@allikas1; @allikas2]
Lehekülg: [@raamat2024, lk 15]
```

### Pildid

```markdown
![Pildi pealkiri](images/pilt.png){#fig:label width=80%}

Viitamine: vaata @fig:label
```

### Tabelid

```markdown
| Veerg 1 | Veerg 2 |
|---------|---------|
| Andmed  | 123     |

: Tabeli pealkiri {#tbl:label}

Viitamine: vaata @tbl:label
```

### Koodiplokid

````markdown
```javascript
const x = 42
console.log(x)
```
````

Inline kood: `` `npm install` ``

### Ristiviited

```markdown
Vaata peatükki @sec:peatukk1
Vaata joonist @fig:diagramm
Vaata tabelit @tbl:andmed
```

### Lisad

```markdown
\appendix

# Esimene lisa {#sec:lisa-a}
<!-- Nummerdatakse: Lisa A -->

# Teine lisa {#sec:lisa-b}
<!-- Nummerdatakse: Lisa B -->
```

## Tõrkeotsing

### "xelatex: command not found"

XeLaTeX pole PATH-is. Lisa see:

```bash
# macOS (TeX Live)
export PATH="/usr/local/texlive/2024/bin/universal-darwin:$PATH"

# Linux
export PATH="/usr/local/texlive/2024/bin/x86_64-linux:$PATH"
```

### "pandoc-crossref: command not found"

Paigalda pandoc-crossref:
- macOS: `brew install pandoc-crossref`
- Linux: Laadi alla [GitHubist](https://github.com/lierdakil/pandoc-crossref/releases)

### Font "Times New Roman" pole saadaval

- macOS: Font on tavaliselt olemas
- Linux: `sudo apt install ttf-mscorefonts-installer`
- Või muuda `template.tex` failis font

### Viited ei tööta

1. Kontrolli, et `kirjandus.bib` failis on vastav kirje
2. Kontrolli, et võti ühtib: `[@minuvõti]` → `@article{minuvõti, ...}`
3. Käivita build uuesti (mõnikord on vaja 2 korda)

### Pikad URL-id lähevad üle serva

See on parandatud `template.tex` failis `\sloppy` käsuga bibliograafia jaoks.

## Kohandamine

### Veerised ja lehekülje suurus

Muuda `template.tex` failis:

```latex
\usepackage[a4paper,left=3cm,right=1.5cm,top=2cm,bottom=2cm]{geometry}
```

### Font

Muuda `template.tex` failis:

```latex
\setmainfont{Times New Roman}  % Asenda oma fondiga
```

### Viitamisstiil

Asenda `style.csl` fail mõne teise CSL stiiliga [Zotero Style Repository](https://www.zotero.org/styles) lehelt.

## Litsents

MIT License - kasuta vabalt oma projektides.

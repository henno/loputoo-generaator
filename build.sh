#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "📦 Genereerimine PDF-i ja DOCX failina..."

echo "🧱 PDF: pandoc -> .tex"

pandoc loputoo.md \
  --metadata-file=meta.yaml \
  --template=template.tex \
  --lua-filter=filters/vikk-structure.lua \
  --filter pandoc-crossref \
  --citeproc \
  --csl=style.csl \
  --bibliography=kirjandus.bib \
  --top-level-division=chapter \
  --number-sections \
  -t latex \
  -s \
  -o loputoo.tex

echo "🧱 PDF: xelatex (pass 1/2)"
xelatex -interaction=nonstopmode -halt-on-error -file-line-error loputoo.tex

echo "🧱 PDF: xelatex (pass 2/2)"
xelatex -interaction=nonstopmode -halt-on-error -file-line-error loputoo.tex

echo "✅ PDF ready: loputoo.pdf"

pandoc loputoo.md \
  --metadata-file=meta.yaml \
  --template=template.tex \
  --lua-filter=filters/vikk-structure.lua \
  --filter pandoc-crossref \
  --citeproc \
  --csl=style.csl \
  --bibliography=kirjandus.bib \
  --top-level-division=chapter \
  --number-sections \
  -o loputoo.docx

echo "✅ DOCX ready: loputoo.docx"
echo "🎉 Build complete!"

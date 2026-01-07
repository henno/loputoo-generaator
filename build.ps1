#!/usr/bin/env powershell
$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "📦 Genereerimine PDF-i ja DOCX failina..."

Write-Host "🧱 PDF: pandoc -> .tex"

& pandoc loputoo.md `
  --metadata-file=meta.yaml `
  --template=template.tex `
  --lua-filter=filters/vikk-structure.lua `
  --filter pandoc-crossref `
  --citeproc `
  --csl=style.csl `
  --bibliography=kirjandus.bib `
  --top-level-division=chapter `
  --number-sections `
  -t latex `
  -s `
  -o loputoo.tex

Write-Host "🧱 PDF: xelatex (pass 1/2)"
& xelatex -interaction=nonstopmode -halt-on-error -file-line-error loputoo.tex

Write-Host "🧱 PDF: xelatex (pass 2/2)"
& xelatex -interaction=nonstopmode -halt-on-error -file-line-error loputoo.tex

Write-Host "✅ PDF ready: loputoo.pdf"

& pandoc loputoo.md `
  --metadata-file=meta.yaml `
  --template=template.tex `
  --lua-filter=filters/vikk-structure.lua `
  --filter pandoc-crossref `
  --citeproc `
  --csl=style.csl `
  --bibliography=kirjandus.bib `
  --top-level-division=chapter `
  --number-sections `
  -o loputoo.docx

Write-Host "✅ DOCX ready: loputoo.docx"
Write-Host "🎉 Build complete!"

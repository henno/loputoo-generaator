# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based thesis generator for Estonian vocational schools (VIKK format). Write thesis in Markdown, generate PDF/DOCX with proper academic formatting.

**Tech stack:** SvelteKit + Bun + Docker (Pandoc + XeLaTeX)

## Development Commands

```bash
# Install dependencies
bun install

# Development server (localhost:3200)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Generate PDF/DOCX from CLI
bun run generate <project-id> <pdf|docx>
```

## Docker Commands

```bash
# Build and run
docker compose up --build

# Development mode with hot reload
docker compose --profile dev up

# Generate PDF from Docker
docker exec loputoo-app bun run generate minu-loputoo pdf
```

## Project Structure

```
src/
├── lib/
│   ├── components/          # Svelte components
│   ├── server/
│   │   ├── storage.ts       # File system operations
│   │   ├── generator.ts     # PDF/DOCX generation (Pandoc)
│   │   └── preview.ts       # HTML preview generation
│   └── types/               # TypeScript interfaces
├── routes/
│   ├── api/                 # REST API endpoints
│   ├── projects/[id]/       # Project editor
│   └── schools/[id]/        # School settings
data/                        # User data (Docker volume)
├── projects/{name}/         # Thesis projects
│   ├── loputoo.md          # Markdown content
│   ├── meta.yaml           # Metadata
│   └── kirjandus.bib       # Bibliography
└── schools/{name}/          # School configurations
    ├── school.yaml         # Settings
    ├── template.tex        # LaTeX template
    ├── style.csl           # Citation style
    └── filters/structure.lua
```

## Key Files

- `src/lib/server/generator.ts` - PDF generation pipeline (Pandoc → XeLaTeX)
- `src/lib/server/storage.ts` - CRUD operations for projects and schools
- `data/schools/vikk/` - Default VIKK school configuration
- `Dockerfile` - Container with Bun + Pandoc + XeLaTeX

## External File Access

All thesis files are plain text in `data/` directory, editable directly:
- AI can modify `loputoo.md`, `meta.yaml`, `kirjandus.bib`
- School templates can be edited in `data/schools/{id}/`
- Generate PDF via CLI or HTTP API

## API Endpoints

```
GET/POST    /api/projects           # List/create projects
GET/PUT/DEL /api/projects/[id]      # Project CRUD
POST        /api/projects/[id]/generate   # Generate PDF/DOCX
POST        /api/projects/[id]/preview    # HTML preview

GET/POST    /api/schools            # List/create schools
GET/PUT/DEL /api/schools/[id]       # School CRUD
GET         /api/schools/[id]/export      # Export as JSON
POST        /api/import/school      # Import from JSON
```

## Markdown Conventions

```markdown
# Section {#sec:label}        - Labeled section
![Caption](img.png){#fig:x}   - Figure with label
@sec:label, @fig:x, @tbl:x    - Cross-references
[@author2024]                 - Citation
```

## Language

Estonian-language project. UI and content in Estonian.

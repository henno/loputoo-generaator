import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, copyFile, mkdir, readFile, access } from 'fs/promises';
import { join } from 'path';
import { stringify as stringifyYaml } from 'yaml';
import {
	createTempDir,
	cleanupTempDir,
	getSchoolTemplate,
	getSchoolCsl,
	getSchoolFilter
} from './storage';
import type { Project } from '$lib/types/project';
import type { School } from '$lib/types/school';

const execAsync = promisify(exec);
const DATA_DIR = process.env.DATA_DIR || './data';

interface GenerationResult {
	filename: string;
	path: string;
}

/**
 * Generate PDF or DOCX from project
 */
export async function generateDocument(
	project: Project,
	school: School,
	format: 'pdf' | 'docx'
): Promise<GenerationResult> {
	const tempDir = await createTempDir('gen');

	try {
		// Prepare all files in temp directory
		await prepareFiles(tempDir, project, school);

		// Generate document
		if (format === 'pdf') {
			await generatePdf(tempDir);
		} else {
			await generateDocx(tempDir);
		}

		// Create output filename
		const authorSlug = project.metadata.author
			.toLowerCase()
			.replace(/\s+/g, '_')
			.replace(/[^a-z0-9_-]/g, '');
		const outputFilename = `${authorSlug}_${project.metadata.year}.${format}`;

		// Copy output to project directory
		const outputDir = join(DATA_DIR, 'projects', project.id, 'output');
		await mkdir(outputDir, { recursive: true });

		const sourceFile = join(tempDir, format === 'pdf' ? 'loputoo.pdf' : 'loputoo.docx');
		const targetFile = join(outputDir, outputFilename);
		await copyFile(sourceFile, targetFile);

		return { filename: outputFilename, path: targetFile };
	} finally {
		// Cleanup temp directory
		await cleanupTempDir(tempDir).catch(console.error);
	}
}

async function prepareFiles(tempDir: string, project: Project, school: School): Promise<void> {
	// Create subdirectories
	await mkdir(join(tempDir, 'filters'), { recursive: true });
	await mkdir(join(tempDir, 'images'), { recursive: true });

	// Write main markdown content
	await writeFile(join(tempDir, 'loputoo.md'), project.content.markdown, 'utf-8');

	// Write bibliography
	await writeFile(join(tempDir, 'kirjandus.bib'), project.content.bibliography, 'utf-8');

	// Generate and write meta.yaml
	const metaYaml = generateMetaYaml(project, school);
	await writeFile(join(tempDir, 'meta.yaml'), metaYaml, 'utf-8');

	// Get and write template files from school
	const [template, csl, filter] = await Promise.all([
		getSchoolTemplate(school.id),
		getSchoolCsl(school.id),
		getSchoolFilter(school.id)
	]);

	// Write template.tex (use default if not provided)
	const templateContent = template || getDefaultTemplate(school);
	await writeFile(join(tempDir, 'template.tex'), templateContent, 'utf-8');

	// Write style.csl (use default if not provided)
	const cslContent = csl || getDefaultCsl();
	await writeFile(join(tempDir, 'style.csl'), cslContent, 'utf-8');

	// Write Lua filter (use default if not provided)
	const filterContent = filter || getDefaultFilter(school);
	await writeFile(join(tempDir, 'filters', 'structure.lua'), filterContent, 'utf-8');

	// Copy images from project
	const projectImagesDir = join(DATA_DIR, 'projects', project.id, 'images');
	for (const image of project.images) {
		try {
			const src = join(projectImagesDir, image.filename);
			const dest = join(tempDir, 'images', image.originalName);
			await copyFile(src, dest);
		} catch {
			// Skip missing images
		}
	}
}

function generateMetaYaml(project: Project, school: School): string {
	const meta = {
		// Document settings
		title: project.metadata.title,
		author: project.metadata.author,
		lang: school.language.documentLang,
		documentclass: school.formatting.documentClass,
		fontsize: school.formatting.fontSize,

		// Institution
		university: project.metadata.university || school.name,
		program: project.metadata.program,
		worktype: project.metadata.worktype,
		advisor: project.metadata.advisor,
		place: project.metadata.place,
		year: project.metadata.year,

		// TOC
		toc: school.tableOfContents.enabled,
		'toc-depth': school.tableOfContents.depth,
		'link-citations': true,

		// pandoc-crossref settings
		figureTitle: school.crossref.figureTitle,
		tableTitle: school.crossref.tableTitle,
		titleDelim: school.crossref.titleDelim,
		figPrefix: school.crossref.figPrefix,
		tblPrefix: school.crossref.tblPrefix
	};

	return stringifyYaml(meta);
}

async function generatePdf(tempDir: string): Promise<void> {
	// Step 1: Pandoc -> LaTeX
	const pandocCmd = [
		'pandoc loputoo.md',
		'--metadata-file=meta.yaml',
		'--template=template.tex',
		'--lua-filter=filters/structure.lua',
		'--filter pandoc-crossref',
		'--citeproc',
		'--csl=style.csl',
		'--bibliography=kirjandus.bib',
		'--top-level-division=chapter',
		'--number-sections',
		'-t latex',
		'-s',
		'-o loputoo.tex'
	].join(' ');

	await execAsync(pandocCmd, { cwd: tempDir, timeout: 60000 });

	// Step 2: XeLaTeX (two passes for cross-references)
	const xelatexCmd = 'xelatex -interaction=nonstopmode -halt-on-error loputoo.tex';

	await execAsync(xelatexCmd, { cwd: tempDir, timeout: 120000 });
	await execAsync(xelatexCmd, { cwd: tempDir, timeout: 120000 });

	// Verify output exists
	try {
		await access(join(tempDir, 'loputoo.pdf'));
	} catch {
		throw new Error('PDF genereerimine ebaõnnestus - väljundfaili ei loodud');
	}
}

async function generateDocx(tempDir: string): Promise<void> {
	const pandocCmd = [
		'pandoc loputoo.md',
		'--metadata-file=meta.yaml',
		'--lua-filter=filters/structure.lua',
		'--filter pandoc-crossref',
		'--citeproc',
		'--csl=style.csl',
		'--bibliography=kirjandus.bib',
		'--top-level-division=chapter',
		'--number-sections',
		'-o loputoo.docx'
	].join(' ');

	await execAsync(pandocCmd, { cwd: tempDir, timeout: 60000 });

	// Verify output exists
	try {
		await access(join(tempDir, 'loputoo.docx'));
	} catch {
		throw new Error('DOCX genereerimine ebaõnnestus - väljundfaili ei loodud');
	}
}

function getDefaultTemplate(school: School): string {
	const { formatting } = school;

	return `\\documentclass[${formatting.fontSize},${formatting.paperSize}]{${formatting.documentClass}}

% Encoding and fonts
\\usepackage{fontspec}
\\setmainfont{${formatting.font.main}}[Ligatures=TeX]
\\setmonofont{${formatting.font.mono}}

% Page geometry
\\usepackage[${formatting.paperSize},left=${formatting.margins.left},right=${formatting.margins.right},top=${formatting.margins.top},bottom=${formatting.margins.bottom}]{geometry}

% Line spacing
\\usepackage{setspace}
\\setstretch{${formatting.lineSpacing}}

% Paragraph formatting
\\setlength{\\parindent}{${formatting.firstLineIndent}}
\\setlength{\\parskip}{${formatting.paragraphSpacing}}

% Estonian language support
\\usepackage{polyglossia}
\\setdefaultlanguage{estonian}

% Citations and bibliography
\\usepackage{csquotes}

% Hyperlinks
\\usepackage[hidelinks]{hyperref}

% Images
\\usepackage{graphicx}
\\graphicspath{{images/}}

% Tables
\\usepackage{longtable}
\\usepackage{booktabs}

% Code listings
\\usepackage{listings}
\\lstset{
  basicstyle=\\ttfamily\\small,
  breaklines=true,
  frame=single,
  numbers=left,
  numberstyle=\\tiny
}

% Headers and footers
\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0pt}

% Title page data
\\title{$title$}
\\author{$author$}
\\date{$year$}

\\begin{document}

% Title page
\\begin{titlepage}
\\centering
\\vspace*{2cm}
{\\Large\\bfseries $university$\\par}
\\vspace{1cm}
{\\large $program$\\par}
\\vspace{3cm}
{\\LARGE\\bfseries $title$\\par}
\\vspace{1cm}
{\\large $worktype$\\par}
\\vspace{3cm}
{\\large $author$\\par}
\\vspace{1cm}
{\\normalsize Juhendaja: $advisor$\\par}
\\vfill
{\\normalsize $place$ $year$\\par}
\\end{titlepage}

% Table of contents
$if(toc)$
\\tableofcontents
\\newpage
$endif$

% Main content
$body$

\\end{document}
`;
}

function getDefaultFilter(school: School): string {
	const unnumbered = school.sections.unnumberedSections
		.map((s) => `["${s.toLowerCase()}"] = true`)
		.join(',\n  ');

	return `local unnumbered_titles = {
  ${unnumbered}
}

local function normalize(s)
  return (s or "")
    :gsub("%s+", " ")
    :gsub("^%s+", "")
    :gsub("%s+$", "")
    :lower()
end

local in_appendix = false

function Header(h)
  if h.level ~= 1 then
    return nil
  end

  local title_text = pandoc.utils.stringify(h.content)
  local key = normalize(title_text)

  if key == "lisad" then
    in_appendix = true
    h.classes:insert("unnumbered")
    if not h.attributes["label"] then
      h.attributes["label"] = title_text
    end
    return h
  end

  if unnumbered_titles[key] then
    h.classes:insert("unnumbered")
    if not h.attributes["label"] then
      h.attributes["label"] = title_text
    end
    return h
  end

  return nil
end

function Pandoc(doc)
  if not in_appendix then
    return doc
  end

  local out = {}

  for _, block in ipairs(doc.blocks) do
    if block.t == "Header" and block.level == 1 then
      local t = normalize(pandoc.utils.stringify(block.content))
      if t == "lisad" then
        table.insert(out, block)
        table.insert(out, pandoc.RawBlock("latex", "\\\\appendix"))
      else
        table.insert(out, block)
      end
    else
      table.insert(out, block)
    end
  end

  doc.blocks = out
  return doc
end
`;
}

function getDefaultCsl(): string {
	return `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="never">
  <info>
    <title>Estonian Author-Date</title>
    <id>estonian-author-date</id>
    <category citation-format="author-date"/>
    <updated>2024-01-01T00:00:00+00:00</updated>
  </info>

  <locale xml:lang="et">
    <terms>
      <term name="page" form="short">lk</term>
      <term name="number" form="short">nr</term>
    </terms>
  </locale>

  <macro name="author">
    <names variable="author">
      <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", "/>
      <substitute>
        <names variable="editor"/>
        <text variable="title"/>
      </substitute>
    </names>
  </macro>

  <macro name="author-short">
    <names variable="author">
      <name form="short" and="symbol" delimiter=", "/>
      <substitute>
        <names variable="editor"/>
        <text variable="title"/>
      </substitute>
    </names>
  </macro>

  <macro name="year">
    <choose>
      <if variable="issued">
        <date variable="issued" date-parts="year" form="numeric"/>
      </if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>

  <citation collapse="year" et-al-min="3" et-al-use-first="1">
    <sort>
      <key macro="author-short"/>
      <key macro="year"/>
    </sort>
    <layout prefix="(" suffix=")" delimiter="; ">
      <group delimiter=", ">
        <text macro="author-short"/>
        <text macro="year"/>
        <group>
          <label variable="locator" form="short"/>
          <text variable="locator"/>
        </group>
      </group>
    </layout>
  </citation>

  <bibliography hanging-indent="true" entry-spacing="0">
    <sort>
      <key macro="author"/>
      <key macro="year"/>
    </sort>
    <layout>
      <group delimiter=" ">
        <text macro="author"/>
        <group prefix="(" suffix=").">
          <text macro="year"/>
        </group>
        <text variable="title" font-style="italic" suffix="."/>
        <text variable="publisher-place" suffix=":"/>
        <text variable="publisher" suffix="."/>
      </group>
    </layout>
  </bibliography>
</style>
`;
}

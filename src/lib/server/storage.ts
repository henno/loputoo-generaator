import { readFile, writeFile, mkdir, rm, readdir, stat, access } from 'fs/promises';
import { join, basename } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { Project, ProjectSummary, ProjectMetadata, ProjectContent } from '$lib/types/project';
import type { School, SchoolSummary } from '$lib/types/school';

const DATA_DIR = process.env.DATA_DIR || './data';
const PROJECTS_DIR = join(DATA_DIR, 'projects');
const SCHOOLS_DIR = join(DATA_DIR, 'schools');
const TEMP_DIR = join(DATA_DIR, 'temp');

// Ensure directories exist
async function ensureDir(dir: string): Promise<void> {
	try {
		await mkdir(dir, { recursive: true });
	} catch {
		// Directory already exists
	}
}

async function exists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

// ============================================================================
// PROJECT OPERATIONS
// ============================================================================

export async function listProjects(): Promise<ProjectSummary[]> {
	await ensureDir(PROJECTS_DIR);

	const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
	const projects: ProjectSummary[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		const projectDir = join(PROJECTS_DIR, entry.name);
		const metaPath = join(projectDir, 'meta.yaml');

		if (!(await exists(metaPath))) continue;

		try {
			const metaContent = await readFile(metaPath, 'utf-8');
			const meta = parseYaml(metaContent) as ProjectMetadata & { school?: string };
			const stats = await stat(metaPath);

			// Get school name
			let schoolName = 'Määramata';
			const schoolId = meta.school || 'vikk';
			const school = await getSchool(schoolId);
			if (school) {
				schoolName = school.shortName || school.name;
			}

			projects.push({
				id: entry.name,
				title: meta.title || 'Pealkirjata',
				author: meta.author || 'Autor määramata',
				schoolId,
				schoolName,
				updatedAt: stats.mtime.toISOString()
			});
		} catch {
			// Skip invalid projects
		}
	}

	return projects;
}

export async function getProject(id: string): Promise<Project | null> {
	const projectDir = join(PROJECTS_DIR, id);

	if (!(await exists(projectDir))) {
		return null;
	}

	try {
		const metaPath = join(projectDir, 'meta.yaml');
		const contentPath = join(projectDir, 'loputoo.md');
		const bibPath = join(projectDir, 'kirjandus.bib');

		const [metaContent, markdownContent, bibContent, dirStats] = await Promise.all([
			readFile(metaPath, 'utf-8').catch(() => ''),
			readFile(contentPath, 'utf-8').catch(() => ''),
			readFile(bibPath, 'utf-8').catch(() => ''),
			stat(projectDir)
		]);

		const meta = parseYaml(metaContent) as ProjectMetadata & { school?: string };

		return {
			id,
			schoolId: meta.school || 'vikk',
			createdAt: dirStats.birthtime.toISOString(),
			updatedAt: dirStats.mtime.toISOString(),
			metadata: {
				title: meta.title || '',
				author: meta.author || '',
				university: meta.university,
				program: meta.program || '',
				worktype: meta.worktype || 'Lõputöö',
				advisor: meta.advisor || '',
				coAdvisor: meta.coAdvisor,
				place: meta.place || '',
				year: meta.year || new Date().getFullYear().toString(),
				abstract: meta.abstract,
				keywords: meta.keywords
			},
			content: {
				markdown: markdownContent,
				bibliography: bibContent
			},
			images: await listProjectImages(id),
			generations: []
		};
	} catch {
		return null;
	}
}

export async function saveProject(
	id: string,
	metadata: ProjectMetadata,
	content: ProjectContent,
	schoolId: string
): Promise<void> {
	const projectDir = join(PROJECTS_DIR, id);
	await ensureDir(projectDir);
	await ensureDir(join(projectDir, 'images'));
	await ensureDir(join(projectDir, 'output'));

	// Save meta.yaml
	const metaYaml = stringifyYaml({
		title: metadata.title,
		author: metadata.author,
		university: metadata.university,
		program: metadata.program,
		worktype: metadata.worktype,
		advisor: metadata.advisor,
		coAdvisor: metadata.coAdvisor,
		place: metadata.place,
		year: metadata.year,
		abstract: metadata.abstract,
		keywords: metadata.keywords,
		school: schoolId
	});
	await writeFile(join(projectDir, 'meta.yaml'), metaYaml, 'utf-8');

	// Save loputoo.md
	await writeFile(join(projectDir, 'loputoo.md'), content.markdown, 'utf-8');

	// Save kirjandus.bib
	await writeFile(join(projectDir, 'kirjandus.bib'), content.bibliography, 'utf-8');
}

export async function createProject(id: string, schoolId: string): Promise<Project> {
	const projectDir = join(PROJECTS_DIR, id);

	if (await exists(projectDir)) {
		throw new Error(`Projekt "${id}" on juba olemas`);
	}

	const now = new Date().toISOString();
	const defaultMetadata: ProjectMetadata = {
		title: '',
		author: '',
		program: '',
		worktype: 'Lõputöö',
		advisor: '',
		place: '',
		year: new Date().getFullYear().toString()
	};

	const defaultContent: ProjectContent = {
		markdown: `# Sissejuhatus {#sec:sissejuhatus}

Siia kirjuta oma lõputöö sissejuhatus.

# Esimene peatükk {#sec:peatukk1}

Siia kirjuta esimese peatüki sisu.

# Kokkuvõte {#sec:kokkuvote}

Siia kirjuta kokkuvõte.

# Kasutatud allikad {.unnumbered}

::: {#refs}
:::
`,
		bibliography: `% Kasutatud allikad (BibTeX formaat)
% Lisa siia oma allikad

@book{naidis2024,
  author = {Autor, Näidis},
  title = {Raamatu pealkiri},
  publisher = {Kirjastus},
  year = {2024},
  address = {Tallinn}
}
`
	};

	await saveProject(id, defaultMetadata, defaultContent, schoolId);

	return {
		id,
		schoolId,
		createdAt: now,
		updatedAt: now,
		metadata: defaultMetadata,
		content: defaultContent,
		images: [],
		generations: []
	};
}

export async function deleteProject(id: string): Promise<void> {
	const projectDir = join(PROJECTS_DIR, id);
	await rm(projectDir, { recursive: true, force: true });
}

async function listProjectImages(id: string): Promise<Project['images']> {
	const imagesDir = join(PROJECTS_DIR, id, 'images');

	if (!(await exists(imagesDir))) {
		return [];
	}

	const entries = await readdir(imagesDir, { withFileTypes: true });
	const images: Project['images'] = [];

	for (const entry of entries) {
		if (!entry.isFile()) continue;
		if (entry.name.startsWith('.')) continue;

		const filePath = join(imagesDir, entry.name);
		const stats = await stat(filePath);

		images.push({
			filename: entry.name,
			originalName: entry.name,
			mimeType: getMimeType(entry.name),
			size: stats.size,
			uploadedAt: stats.mtime.toISOString()
		});
	}

	return images;
}

function getMimeType(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		svg: 'image/svg+xml',
		webp: 'image/webp'
	};
	return mimeTypes[ext || ''] || 'application/octet-stream';
}

// ============================================================================
// SCHOOL OPERATIONS
// ============================================================================

export async function listSchools(): Promise<SchoolSummary[]> {
	await ensureDir(SCHOOLS_DIR);

	const entries = await readdir(SCHOOLS_DIR, { withFileTypes: true });
	const schools: SchoolSummary[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		const schoolDir = join(SCHOOLS_DIR, entry.name);
		const schoolPath = join(schoolDir, 'school.yaml');

		if (!(await exists(schoolPath))) continue;

		try {
			const content = await readFile(schoolPath, 'utf-8');
			const school = parseYaml(content) as School;

			schools.push({
				id: entry.name,
				name: school.name || entry.name,
				shortName: school.shortName || entry.name.toUpperCase()
			});
		} catch {
			// Skip invalid schools
		}
	}

	return schools;
}

export async function getSchool(id: string): Promise<School | null> {
	const schoolDir = join(SCHOOLS_DIR, id);
	const schoolPath = join(schoolDir, 'school.yaml');

	if (!(await exists(schoolPath))) {
		return null;
	}

	try {
		const content = await readFile(schoolPath, 'utf-8');
		const school = parseYaml(content) as School;
		const stats = await stat(schoolPath);

		return {
			...school,
			id,
			createdAt: stats.birthtime.toISOString(),
			updatedAt: stats.mtime.toISOString()
		};
	} catch {
		return null;
	}
}

export async function saveSchool(school: School): Promise<void> {
	const schoolDir = join(SCHOOLS_DIR, school.id);
	await ensureDir(schoolDir);
	await ensureDir(join(schoolDir, 'filters'));

	// Save school.yaml (without files that are stored separately)
	const schoolYaml = stringifyYaml({
		name: school.name,
		shortName: school.shortName,
		formatting: school.formatting,
		titlePage: school.titlePage,
		headersFooters: school.headersFooters,
		tableOfContents: school.tableOfContents,
		sections: school.sections,
		bibliography: school.bibliography,
		crossref: school.crossref,
		language: school.language
	});
	await writeFile(join(schoolDir, 'school.yaml'), schoolYaml, 'utf-8');
}

export async function getSchoolTemplate(id: string): Promise<string> {
	const templatePath = join(SCHOOLS_DIR, id, 'template.tex');
	try {
		return await readFile(templatePath, 'utf-8');
	} catch {
		return '';
	}
}

export async function saveSchoolTemplate(id: string, template: string): Promise<void> {
	const schoolDir = join(SCHOOLS_DIR, id);
	await ensureDir(schoolDir);
	await writeFile(join(schoolDir, 'template.tex'), template, 'utf-8');
}

export async function getSchoolCsl(id: string): Promise<string> {
	const cslPath = join(SCHOOLS_DIR, id, 'style.csl');
	try {
		return await readFile(cslPath, 'utf-8');
	} catch {
		return '';
	}
}

export async function saveSchoolCsl(id: string, csl: string): Promise<void> {
	const schoolDir = join(SCHOOLS_DIR, id);
	await ensureDir(schoolDir);
	await writeFile(join(schoolDir, 'style.csl'), csl, 'utf-8');
}

export async function getSchoolFilter(id: string): Promise<string> {
	const filterPath = join(SCHOOLS_DIR, id, 'filters', 'structure.lua');
	try {
		return await readFile(filterPath, 'utf-8');
	} catch {
		return '';
	}
}

export async function saveSchoolFilter(id: string, filter: string): Promise<void> {
	const schoolDir = join(SCHOOLS_DIR, id);
	await ensureDir(join(schoolDir, 'filters'));
	await writeFile(join(schoolDir, 'filters', 'structure.lua'), filter, 'utf-8');
}

export async function deleteSchool(id: string): Promise<void> {
	const schoolDir = join(SCHOOLS_DIR, id);
	await rm(schoolDir, { recursive: true, force: true });
}

export async function exportSchool(id: string): Promise<object> {
	const school = await getSchool(id);
	if (!school) throw new Error(`Kooli "${id}" ei leitud`);

	const [template, csl, filter] = await Promise.all([
		getSchoolTemplate(id),
		getSchoolCsl(id),
		getSchoolFilter(id)
	]);

	return {
		...school,
		files: {
			template,
			csl,
			filter
		}
	};
}

export async function importSchool(
	id: string,
	data: School & { files?: { template?: string; csl?: string; filter?: string } }
): Promise<void> {
	const schoolDir = join(SCHOOLS_DIR, id);

	if (await exists(schoolDir)) {
		throw new Error(`Kool "${id}" on juba olemas`);
	}

	await saveSchool({ ...data, id });

	if (data.files?.template) {
		await saveSchoolTemplate(id, data.files.template);
	}
	if (data.files?.csl) {
		await saveSchoolCsl(id, data.files.csl);
	}
	if (data.files?.filter) {
		await saveSchoolFilter(id, data.files.filter);
	}
}

// ============================================================================
// TEMP DIRECTORY OPERATIONS
// ============================================================================

export async function createTempDir(prefix: string = 'build'): Promise<string> {
	await ensureDir(TEMP_DIR);
	const id = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const dir = join(TEMP_DIR, id);
	await mkdir(dir);
	return dir;
}

export async function cleanupTempDir(dir: string): Promise<void> {
	await rm(dir, { recursive: true, force: true });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeDataDir(): Promise<void> {
	await ensureDir(PROJECTS_DIR);
	await ensureDir(SCHOOLS_DIR);
	await ensureDir(TEMP_DIR);
}

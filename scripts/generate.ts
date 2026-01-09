#!/usr/bin/env bun
/**
 * CLI script for generating PDF/DOCX from command line
 *
 * Usage:
 *   bun run generate <project-id> <format>
 *
 * Examples:
 *   bun run generate minu-loputoo pdf
 *   bun run generate minu-loputoo docx
 *
 * From Docker:
 *   docker exec loputoo-app bun run generate minu-loputoo pdf
 */

import { getProject, getSchool } from '../src/lib/server/storage';
import { generateDocument } from '../src/lib/server/generator';

async function main() {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.error('Kasutamine: bun run generate <project-id> <format>');
		console.error('  format: pdf või docx');
		console.error('');
		console.error('Näide:');
		console.error('  bun run generate minu-loputoo pdf');
		process.exit(1);
	}

	const [projectId, format] = args;

	if (format !== 'pdf' && format !== 'docx') {
		console.error(`Vigane formaat: ${format}`);
		console.error('Formaat peab olema "pdf" või "docx"');
		process.exit(1);
	}

	console.log(`Laen projekti "${projectId}"...`);

	const project = await getProject(projectId);
	if (!project) {
		console.error(`Projekti "${projectId}" ei leitud`);
		process.exit(1);
	}

	console.log(`Laen kooli "${project.schoolId}" seaded...`);

	const school = await getSchool(project.schoolId);
	if (!school) {
		console.error(`Kooli "${project.schoolId}" seadeid ei leitud`);
		process.exit(1);
	}

	console.log(`Genereerin ${format.toUpperCase()}...`);

	try {
		const result = await generateDocument(project, school, format);
		console.log(`✅ Valmis: ${result.path}`);
	} catch (error) {
		console.error(`❌ Genereerimine ebaõnnestus:`);
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();

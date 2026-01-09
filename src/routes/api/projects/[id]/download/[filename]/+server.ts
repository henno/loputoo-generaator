import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = process.env.DATA_DIR || './data';

// GET /api/projects/[id]/download/[filename] - Download generated file
export const GET: RequestHandler = async ({ params }) => {
	const { id, filename } = params;

	// Security: validate filename to prevent path traversal
	if (!filename || filename.includes('..') || filename.includes('/')) {
		throw error(400, 'Vigane failinimi');
	}

	const filePath = join(DATA_DIR, 'projects', id, 'output', filename);

	try {
		await access(filePath);
	} catch {
		throw error(404, 'Faili ei leitud');
	}

	const content = await readFile(filePath);

	// Determine content type
	let contentType = 'application/octet-stream';
	if (filename.endsWith('.pdf')) {
		contentType = 'application/pdf';
	} else if (filename.endsWith('.docx')) {
		contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
	}

	return new Response(content, {
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Length': content.length.toString()
		}
	});
};

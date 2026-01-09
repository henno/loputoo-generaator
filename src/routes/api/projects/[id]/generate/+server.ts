import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProject, getSchool } from '$lib/server/storage';
import { generateDocument } from '$lib/server/generator';

// POST /api/projects/[id]/generate - Generate PDF or DOCX
export const POST: RequestHandler = async ({ params, request }) => {
	const project = await getProject(params.id);

	if (!project) {
		throw error(404, `Projekti "${params.id}" ei leitud`);
	}

	const body = await request.json();
	const format = body.format as 'pdf' | 'docx';

	if (!['pdf', 'docx'].includes(format)) {
		throw error(400, 'Formaat peab olema "pdf" või "docx"');
	}

	const school = await getSchool(project.schoolId);

	if (!school) {
		throw error(404, `Kooli "${project.schoolId}" seadeid ei leitud`);
	}

	try {
		const result = await generateDocument(project, school, format);

		return json({
			success: true,
			filename: result.filename,
			downloadUrl: `/api/projects/${params.id}/download/${result.filename}`
		});
	} catch (err) {
		console.error('Generation error:', err);
		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Genereerimine ebaõnnestus'
			},
			{ status: 500 }
		);
	}
};

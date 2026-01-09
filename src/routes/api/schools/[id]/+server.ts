import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getSchool,
	saveSchool,
	deleteSchool,
	getSchoolTemplate,
	saveSchoolTemplate,
	getSchoolCsl,
	saveSchoolCsl,
	getSchoolFilter,
	saveSchoolFilter
} from '$lib/server/storage';

// GET /api/schools/[id] - Get school by ID
export const GET: RequestHandler = async ({ params }) => {
	const school = await getSchool(params.id);

	if (!school) {
		throw error(404, `Kooli "${params.id}" ei leitud`);
	}

	// Include template files
	const [template, csl, filter] = await Promise.all([
		getSchoolTemplate(params.id),
		getSchoolCsl(params.id),
		getSchoolFilter(params.id)
	]);

	return json({
		...school,
		files: {
			template,
			csl,
			filter
		}
	});
};

// PUT /api/schools/[id] - Update school
export const PUT: RequestHandler = async ({ params, request }) => {
	const existing = await getSchool(params.id);

	if (!existing) {
		throw error(404, `Kooli "${params.id}" ei leitud`);
	}

	const body = await request.json();
	const { files, ...schoolData } = body;

	// Update school settings
	const updated = {
		...existing,
		...schoolData,
		id: params.id,
		updatedAt: new Date().toISOString()
	};

	await saveSchool(updated);

	// Update template files if provided
	if (files) {
		if (files.template !== undefined) {
			await saveSchoolTemplate(params.id, files.template);
		}
		if (files.csl !== undefined) {
			await saveSchoolCsl(params.id, files.csl);
		}
		if (files.filter !== undefined) {
			await saveSchoolFilter(params.id, files.filter);
		}
	}

	return json(updated);
};

// DELETE /api/schools/[id] - Delete school
export const DELETE: RequestHandler = async ({ params }) => {
	const existing = await getSchool(params.id);

	if (!existing) {
		throw error(404, `Kooli "${params.id}" ei leitud`);
	}

	// Don't allow deleting the default VIKK school
	if (params.id === 'vikk') {
		throw error(403, 'Vaikimisi VIKK kooli ei saa kustutada');
	}

	await deleteSchool(params.id);
	return json({ success: true });
};

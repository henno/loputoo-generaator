import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProject, saveProject, deleteProject } from '$lib/server/storage';

// GET /api/projects/[id] - Get project by ID
export const GET: RequestHandler = async ({ params }) => {
	const project = await getProject(params.id);

	if (!project) {
		throw error(404, `Projekti "${params.id}" ei leitud`);
	}

	return json(project);
};

// PUT /api/projects/[id] - Update project
export const PUT: RequestHandler = async ({ params, request }) => {
	const existing = await getProject(params.id);

	if (!existing) {
		throw error(404, `Projekti "${params.id}" ei leitud`);
	}

	const body = await request.json();
	const { metadata, content, schoolId } = body;

	await saveProject(
		params.id,
		metadata || existing.metadata,
		content || existing.content,
		schoolId || existing.schoolId
	);

	const updated = await getProject(params.id);
	return json(updated);
};

// DELETE /api/projects/[id] - Delete project
export const DELETE: RequestHandler = async ({ params }) => {
	const existing = await getProject(params.id);

	if (!existing) {
		throw error(404, `Projekti "${params.id}" ei leitud`);
	}

	await deleteProject(params.id);
	return json({ success: true });
};

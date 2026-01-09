import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listProjects, createProject } from '$lib/server/storage';

// GET /api/projects - List all projects
export const GET: RequestHandler = async () => {
	const projects = await listProjects();
	return json(projects);
};

// POST /api/projects - Create new project
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { id, schoolId = 'vikk' } = body;

	if (!id) {
		throw error(400, 'Projekti ID on kohustuslik');
	}

	// Validate ID format (alphanumeric, hyphens, underscores)
	if (!/^[a-z0-9_-]+$/i.test(id)) {
		throw error(400, 'Projekti ID võib sisaldada ainult tähti, numbreid, sidekriipse ja alakriipse');
	}

	try {
		const project = await createProject(id, schoolId);
		return json(project, { status: 201 });
	} catch (err) {
		if (err instanceof Error && err.message.includes('juba olemas')) {
			throw error(409, err.message);
		}
		throw error(500, 'Projekti loomine ebaõnnestus');
	}
};

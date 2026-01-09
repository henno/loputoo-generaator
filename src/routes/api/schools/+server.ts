import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSchools, saveSchool } from '$lib/server/storage';
import { defaultSchoolSettings } from '$lib/types/school';

// GET /api/schools - List all schools
export const GET: RequestHandler = async () => {
	const schools = await listSchools();
	return json(schools);
};

// POST /api/schools - Create new school
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { id, name, shortName } = body;

	if (!id) {
		throw error(400, 'Kooli ID on kohustuslik');
	}

	if (!name) {
		throw error(400, 'Kooli nimi on kohustuslik');
	}

	// Validate ID format
	if (!/^[a-z0-9_-]+$/i.test(id)) {
		throw error(400, 'Kooli ID võib sisaldada ainult tähti, numbreid, sidekriipse ja alakriipse');
	}

	const now = new Date().toISOString();
	const school = {
		id,
		name,
		shortName: shortName || id.toUpperCase(),
		createdAt: now,
		updatedAt: now,
		...defaultSchoolSettings
	};

	try {
		await saveSchool(school);
		return json(school, { status: 201 });
	} catch (err) {
		if (err instanceof Error && err.message.includes('juba olemas')) {
			throw error(409, err.message);
		}
		throw error(500, 'Kooli loomine ebaõnnestus');
	}
};

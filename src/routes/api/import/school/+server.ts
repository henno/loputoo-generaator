import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { importSchool } from '$lib/server/storage';

// POST /api/import/school - Import school from JSON
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.id) {
		throw error(400, 'Kooli ID on kohustuslik');
	}

	if (!body.name) {
		throw error(400, 'Kooli nimi on kohustuslik');
	}

	// Validate ID format
	if (!/^[a-z0-9_-]+$/i.test(body.id)) {
		throw error(400, 'Kooli ID võib sisaldada ainult tähti, numbreid, sidekriipse ja alakriipse');
	}

	try {
		await importSchool(body.id, body);
		return json({ success: true, id: body.id }, { status: 201 });
	} catch (err) {
		if (err instanceof Error && err.message.includes('juba olemas')) {
			throw error(409, err.message);
		}
		throw error(500, 'Importimine ebaõnnestus');
	}
};

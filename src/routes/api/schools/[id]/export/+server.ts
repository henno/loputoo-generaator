import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exportSchool } from '$lib/server/storage';

// GET /api/schools/[id]/export - Export school as JSON
export const GET: RequestHandler = async ({ params }) => {
	try {
		const data = await exportSchool(params.id);

		return new Response(JSON.stringify(data, null, 2), {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="${params.id}-school-settings.json"`
			}
		});
	} catch (err) {
		if (err instanceof Error && err.message.includes('ei leitud')) {
			throw error(404, err.message);
		}
		throw error(500, 'Eksportimine ebaõnnestus');
	}
};

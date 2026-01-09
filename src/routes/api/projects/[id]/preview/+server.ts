import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generatePreview } from '$lib/server/preview';

// POST /api/projects/[id]/preview - Generate HTML preview
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { markdown, metadata } = body;

	if (!markdown) {
		throw error(400, 'Markdown sisu on kohustuslik');
	}

	try {
		const html = await generatePreview(markdown, metadata || {});
		return json({ html });
	} catch (err) {
		console.error('Preview error:', err);
		return json(
			{
				html: `<p class="error">Eelvaate genereerimine ebaõnnestus: ${err instanceof Error ? err.message : 'Tundmatu viga'}</p>`
			},
			{ status: 500 }
		);
	}
};

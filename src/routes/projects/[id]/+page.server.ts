import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProject, listSchools } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	const project = await getProject(params.id);

	if (!project) {
		throw error(404, `Projekti "${params.id}" ei leitud`);
	}

	const schools = await listSchools();

	return {
		project,
		schools
	};
};

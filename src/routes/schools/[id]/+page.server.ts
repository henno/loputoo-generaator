import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSchool, getSchoolTemplate, getSchoolCsl, getSchoolFilter } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	const school = await getSchool(params.id);

	if (!school) {
		throw error(404, `Kooli "${params.id}" ei leitud`);
	}

	const [template, csl, filter] = await Promise.all([
		getSchoolTemplate(params.id),
		getSchoolCsl(params.id),
		getSchoolFilter(params.id)
	]);

	return {
		school,
		files: {
			template,
			csl,
			filter
		}
	};
};

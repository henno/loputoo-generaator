import type { PageServerLoad } from './$types';
import { listSchools } from '$lib/server/storage';

export const load: PageServerLoad = async () => {
	const schools = await listSchools();

	return {
		schools
	};
};

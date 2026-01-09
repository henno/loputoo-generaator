import type { PageServerLoad } from './$types';
import { listProjects } from '$lib/server/storage';

export const load: PageServerLoad = async () => {
	const projects = await listProjects();

	return {
		projects: projects.sort(
			(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		)
	};
};

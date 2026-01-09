import type { PageServerLoad } from './$types';
import { listProjects } from '$lib/server/storage';

export const load: PageServerLoad = async () => {
	const projects = await listProjects();

	// Sort by updatedAt and take the 6 most recent
	const recentProjects = projects
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		.slice(0, 6);

	return {
		recentProjects
	};
};

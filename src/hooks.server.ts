import type { Handle } from '@sveltejs/kit';
import { initializeDataDir } from '$lib/server/storage';

// Initialize data directories on startup
await initializeDataDir();

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

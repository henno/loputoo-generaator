<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let projectId = $state('');
	let schoolId = $state('vikk');
	let error = $state('');
	let isSubmitting = $state(false);

	function generateSlug(text: string): string {
		return text
			.toLowerCase()
			.replace(/[äöüõ]/g, (c) => ({ ä: 'a', ö: 'o', ü: 'u', õ: 'o' })[c] || c)
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		const id = generateSlug(projectId) || projectId;

		if (!id) {
			error = 'Projekti nimi on kohustuslik';
			return;
		}

		if (!/^[a-z0-9_-]+$/i.test(id)) {
			error = 'Projekti nimi võib sisaldada ainult tähti, numbreid ja sidekriipse';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, schoolId })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Projekti loomine ebaõnnestus');
			}

			goto(`/projects/${id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Tundmatu viga';
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Uus projekt - Lõputöö Generaator</title>
</svelte:head>

<div class="new-project-page">
	<h1>Uus projekt</h1>

	<form onsubmit={handleSubmit} class="form">
		<div class="form-group">
			<label for="projectId">Projekti nimi (kausta nimi)</label>
			<input
				type="text"
				id="projectId"
				bind:value={projectId}
				placeholder="nt. minu-loputoo"
				required
			/>
			<p class="hint">
				See on kausta nimi, kus sinu lõputöö failid asuvad. Kasuta väiketähti ja sidekriipse.
			</p>
		</div>

		<div class="form-group">
			<label for="schoolId">Kool</label>
			<select id="schoolId" bind:value={schoolId}>
				{#each data.schools as school}
					<option value={school.id}>{school.name} ({school.shortName})</option>
				{/each}
			</select>
			<p class="hint">Kooli valik määrab vormistusnõuded (veerised, font, viitamisstiil).</p>
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<div class="form-actions">
			<a href="/projects" class="btn btn-secondary">Tühista</a>
			<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
				{isSubmitting ? 'Loon...' : 'Loo projekt'}
			</button>
		</div>
	</form>
</div>

<style>
	.new-project-page {
		max-width: 600px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	h1 {
		margin-bottom: var(--spacing-xl);
	}

	.form {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
	}

	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: var(--spacing-sm);
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 1rem;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.hint {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-top: var(--spacing-xs);
	}

	.error {
		background: #fef2f2;
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-lg);
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-lg);
		border: none;
		border-radius: var(--radius-md);
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.btn-secondary:hover {
		background: var(--color-border);
		text-decoration: none;
	}
</style>

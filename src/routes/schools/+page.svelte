<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showNewForm = $state(false);
	let newId = $state('');
	let newName = $state('');
	let newShortName = $state('');
	let error = $state('');
	let isSubmitting = $state(false);

	// Import state
	let importFile: HTMLInputElement;

	function generateSlug(text: string): string {
		return text
			.toLowerCase()
			.replace(/[äöüõ]/g, (c) => ({ ä: 'a', ö: 'o', ü: 'u', õ: 'o' })[c] || c)
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	async function createSchool() {
		error = '';
		const id = generateSlug(newId) || newId;

		if (!id || !newName) {
			error = 'ID ja nimi on kohustuslikud';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/schools', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id,
					name: newName,
					shortName: newShortName || id.toUpperCase()
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Kooli loomine ebaõnnestus');
			}

			goto(`/schools/${id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Tundmatu viga';
			isSubmitting = false;
		}
	}

	async function importSchool() {
		const file = importFile.files?.[0];
		if (!file) return;

		try {
			const content = await file.text();
			const data = JSON.parse(content);

			const response = await fetch('/api/import/school', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: content
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || 'Importimine ebaõnnestus');
			}

			window.location.reload();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Importimine ebaõnnestus';
		}
	}
</script>

<svelte:head>
	<title>Koolid - Lõputöö Generaator</title>
</svelte:head>

<div class="schools-page">
	<header class="page-header">
		<h1>Koolide seaded</h1>
		<div class="header-actions">
			<label class="btn btn-secondary">
				Impordi JSON
				<input
					type="file"
					accept=".json"
					bind:this={importFile}
					onchange={importSchool}
					style="display: none"
				/>
			</label>
			<button class="btn btn-primary" onclick={() => (showNewForm = !showNewForm)}>
				{showNewForm ? 'Tühista' : '+ Uus kool'}
			</button>
		</div>
	</header>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if showNewForm}
		<div class="new-school-form">
			<h2>Lisa uus kool</h2>
			<div class="form-row">
				<label for="newId">ID (kausta nimi)</label>
				<input
					type="text"
					id="newId"
					bind:value={newId}
					placeholder="nt. tartu-kutsehariduskeskus"
				/>
			</div>
			<div class="form-row">
				<label for="newName">Kooli nimi</label>
				<input type="text" id="newName" bind:value={newName} placeholder="Tartu Kutsehariduskeskus" />
			</div>
			<div class="form-row">
				<label for="newShortName">Lühend</label>
				<input type="text" id="newShortName" bind:value={newShortName} placeholder="TKHK" />
			</div>
			<button class="btn btn-primary" onclick={createSchool} disabled={isSubmitting}>
				{isSubmitting ? 'Loon...' : 'Loo kool'}
			</button>
		</div>
	{/if}

	<div class="school-list">
		{#each data.schools as school}
			<div class="school-card">
				<a href="/schools/{school.id}" class="school-info">
					<h2>{school.name}</h2>
					<span class="shortname">{school.shortName}</span>
				</a>
				<div class="school-actions">
					<a href="/api/schools/{school.id}/export" class="btn btn-small">
						Ekspordi
					</a>
				</div>
			</div>
		{/each}
	</div>

	{#if data.schools.length === 0}
		<div class="empty-state">
			<p>Ühtegi kooli pole veel lisatud.</p>
		</div>
	{/if}
</div>

<style>
	.schools-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);
	}

	.page-header h1 {
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-md);
	}

	.error-message {
		background: #fef2f2;
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-lg);
	}

	.new-school-form {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
	}

	.new-school-form h2 {
		margin: 0 0 var(--spacing-lg) 0;
		font-size: 1.25rem;
	}

	.form-row {
		margin-bottom: var(--spacing-md);
	}

	.form-row label {
		display: block;
		font-weight: 500;
		margin-bottom: var(--spacing-xs);
	}

	.form-row input {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	.school-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.school-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.school-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.school-info {
		text-decoration: none;
		flex: 1;
	}

	.school-info:hover {
		text-decoration: none;
	}

	.school-info h2 {
		margin: 0;
		font-size: 1.1rem;
		color: var(--color-text);
	}

	.shortname {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-secondary);
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
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.btn-secondary {
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-small {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.875rem;
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

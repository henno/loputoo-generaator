<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Projektid - Lõputöö Generaator</title>
</svelte:head>

<div class="projects-page">
	<header class="page-header">
		<h1>Minu projektid</h1>
		<a href="/projects/new" class="btn btn-primary">+ Uus projekt</a>
	</header>

	{#if data.projects.length === 0}
		<div class="empty-state">
			<p>Sul pole veel ühtegi projekti.</p>
			<a href="/projects/new" class="btn btn-primary">Loo esimene projekt</a>
		</div>
	{:else}
		<div class="project-grid">
			{#each data.projects as project}
				<a href="/projects/{project.id}" class="project-card">
					<h2>{project.title || 'Pealkirjata'}</h2>
					<p class="author">{project.author || 'Autor määramata'}</p>
					<div class="meta">
						<span class="school">{project.schoolName}</span>
						<span class="date">{new Date(project.updatedAt).toLocaleDateString('et-EE')}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.projects-page {
		max-width: 1200px;
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

	.btn-primary:hover {
		background: var(--color-primary-hover);
		text-decoration: none;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-xl) * 2;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-lg);
	}

	.project-card {
		padding: var(--spacing-lg);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: box-shadow 0.2s, border-color 0.2s;
	}

	.project-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.project-card h2 {
		color: var(--color-text);
		font-size: 1.25rem;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.project-card .author {
		color: var(--color-text-secondary);
		margin: 0 0 var(--spacing-md) 0;
	}

	.project-card .meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.project-card .school {
		background: var(--color-bg-secondary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
	}
</style>

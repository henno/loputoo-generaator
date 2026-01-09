<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Lõputöö Generaator</title>
</svelte:head>

<div class="dashboard">
	<header class="header">
		<h1>Tere tulemast!</h1>
		<p>VIKK formaadis lõputöö generaator. Kirjuta Markdownis, genereeri PDF ja DOCX.</p>
	</header>

	<section class="quick-actions">
		<a href="/projects/new" class="action-card">
			<span class="icon">+</span>
			<span class="label">Uus projekt</span>
		</a>
		<a href="/projects" class="action-card">
			<span class="icon">📁</span>
			<span class="label">Minu projektid</span>
		</a>
		<a href="/schools" class="action-card">
			<span class="icon">🏫</span>
			<span class="label">Koolide seaded</span>
		</a>
	</section>

	{#if data.recentProjects && data.recentProjects.length > 0}
		<section class="recent">
			<h2>Hiljutised projektid</h2>
			<div class="project-list">
				{#each data.recentProjects as project}
					<a href="/projects/{project.id}" class="project-card">
						<h3>{project.title || 'Pealkirjata'}</h3>
						<p class="meta">{project.author} · {project.schoolName}</p>
						<p class="date">Muudetud: {new Date(project.updatedAt).toLocaleDateString('et-EE')}</p>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	.header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}

	.header h1 {
		font-size: 2rem;
		margin-bottom: var(--spacing-sm);
	}

	.header p {
		color: var(--color-text-secondary);
	}

	.quick-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		background: var(--color-bg);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.action-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.action-card .icon {
		font-size: 2rem;
		margin-bottom: var(--spacing-sm);
	}

	.action-card .label {
		color: var(--color-text);
		font-weight: 500;
	}

	.recent h2 {
		margin-bottom: var(--spacing-md);
	}

	.project-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-md);
	}

	.project-card {
		padding: var(--spacing-lg);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: box-shadow 0.2s;
	}

	.project-card:hover {
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.project-card h3 {
		color: var(--color-text);
		margin-bottom: var(--spacing-xs);
	}

	.project-card .meta {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.project-card .date {
		color: var(--color-text-secondary);
		font-size: 0.75rem;
		margin-top: var(--spacing-sm);
	}
</style>

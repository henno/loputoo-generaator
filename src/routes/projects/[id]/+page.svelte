<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// State
	let activeTab = $state<'content' | 'metadata' | 'bibliography'>('content');
	let previewHtml = $state('');
	let isGenerating = $state(false);
	let isSaving = $state(false);
	let lastSaved = $state<Date | null>(null);
	let error = $state('');

	// Form data
	let markdown = $state(data.project.content.markdown);
	let bibliography = $state(data.project.content.bibliography);
	let metadata = $state({ ...data.project.metadata });
	let schoolId = $state(data.project.schoolId);

	// Debounce timer
	let previewTimeout: ReturnType<typeof setTimeout>;
	let saveTimeout: ReturnType<typeof setTimeout>;

	// Update preview when markdown changes
	$effect(() => {
		if (markdown) {
			clearTimeout(previewTimeout);
			previewTimeout = setTimeout(() => updatePreview(), 500);
		}
	});

	// Auto-save when content changes
	$effect(() => {
		// Track changes to trigger auto-save
		const _ = [markdown, bibliography, JSON.stringify(metadata), schoolId];
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => saveProject(), 2000);
	});

	async function updatePreview() {
		try {
			const response = await fetch(`/api/projects/${data.project.id}/preview`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ markdown, metadata })
			});
			const result = await response.json();
			previewHtml = result.html;
		} catch (err) {
			console.error('Preview error:', err);
		}
	}

	async function saveProject() {
		if (isSaving) return;
		isSaving = true;
		error = '';

		try {
			const response = await fetch(`/api/projects/${data.project.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					metadata,
					content: { markdown, bibliography },
					schoolId
				})
			});

			if (!response.ok) {
				throw new Error('Salvestamine ebaõnnestus');
			}

			lastSaved = new Date();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Salvestamine ebaõnnestus';
		} finally {
			isSaving = false;
		}
	}

	async function generateDocument(format: 'pdf' | 'docx') {
		// Save first
		await saveProject();

		isGenerating = true;
		error = '';

		try {
			const response = await fetch(`/api/projects/${data.project.id}/generate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ format })
			});

			const result = await response.json();

			if (result.success) {
				window.open(result.downloadUrl, '_blank');
			} else {
				error = result.error || 'Genereerimine ebaõnnestus';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Genereerimine ebaõnnestus';
		} finally {
			isGenerating = false;
		}
	}

	onMount(() => {
		updatePreview();
	});
</script>

<svelte:head>
	<title>{metadata.title || 'Pealkirjata'} - Lõputöö Generaator</title>
</svelte:head>

<div class="editor-layout">
	<header class="editor-header">
		<div class="header-left">
			<a href="/projects" class="back-link">← Projektid</a>
			<h1>{metadata.title || 'Pealkirjata'}</h1>
		</div>
		<div class="header-right">
			<select bind:value={schoolId} class="school-select">
				{#each data.schools as school}
					<option value={school.id}>{school.shortName}</option>
				{/each}
			</select>

			<span class="save-status">
				{#if isSaving}
					Salvestab...
				{:else if lastSaved}
					Salvestatud {lastSaved.toLocaleTimeString('et-EE')}
				{/if}
			</span>

			<button
				class="btn btn-secondary"
				onclick={() => generateDocument('docx')}
				disabled={isGenerating}
			>
				DOCX
			</button>
			<button
				class="btn btn-primary"
				onclick={() => generateDocument('pdf')}
				disabled={isGenerating}
			>
				{isGenerating ? 'Genereerin...' : 'PDF'}
			</button>
		</div>
	</header>

	{#if error}
		<div class="error-bar">{error}</div>
	{/if}

	<div class="editor-main">
		<div class="editor-panel">
			<div class="tabs">
				<button
					class="tab"
					class:active={activeTab === 'content'}
					onclick={() => (activeTab = 'content')}
				>
					Sisu
				</button>
				<button
					class="tab"
					class:active={activeTab === 'metadata'}
					onclick={() => (activeTab = 'metadata')}
				>
					Metaandmed
				</button>
				<button
					class="tab"
					class:active={activeTab === 'bibliography'}
					onclick={() => (activeTab = 'bibliography')}
				>
					Kirjandus
				</button>
			</div>

			<div class="tab-content">
				{#if activeTab === 'content'}
					<textarea
						class="markdown-editor"
						bind:value={markdown}
						placeholder="Kirjuta siia oma lõputöö Markdown formaadis..."
						spellcheck="true"
					></textarea>
				{:else if activeTab === 'metadata'}
					<div class="metadata-form">
						<div class="form-row">
							<label for="title">Pealkiri</label>
							<input type="text" id="title" bind:value={metadata.title} />
						</div>
						<div class="form-row">
							<label for="author">Autor</label>
							<input type="text" id="author" bind:value={metadata.author} />
						</div>
						<div class="form-row">
							<label for="program">Eriala</label>
							<input type="text" id="program" bind:value={metadata.program} />
						</div>
						<div class="form-row">
							<label for="worktype">Töö liik</label>
							<input
								type="text"
								id="worktype"
								bind:value={metadata.worktype}
								placeholder="Lõputöö, Eksamitöö"
							/>
						</div>
						<div class="form-row">
							<label for="advisor">Juhendaja</label>
							<input type="text" id="advisor" bind:value={metadata.advisor} />
						</div>
						<div class="form-row two-col">
							<div>
								<label for="place">Koht</label>
								<input type="text" id="place" bind:value={metadata.place} />
							</div>
							<div>
								<label for="year">Aasta</label>
								<input type="text" id="year" bind:value={metadata.year} />
							</div>
						</div>
					</div>
				{:else if activeTab === 'bibliography'}
					<textarea
						class="bibliography-editor"
						bind:value={bibliography}
						placeholder="Lisa siia oma allikad BibTeX formaadis..."
						spellcheck="false"
					></textarea>
				{/if}
			</div>
		</div>

		<div class="preview-panel">
			<div class="preview-header">Eelvaade</div>
			<div class="preview-content">
				{@html previewHtml}
			</div>
		</div>
	</div>
</div>

<style>
	.editor-layout {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 60px);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.back-link {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.header-left h1 {
		margin: 0;
		font-size: 1.25rem;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.school-select {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	.save-status {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.error-bar {
		background: #fef2f2;
		color: var(--color-error);
		padding: var(--spacing-sm) var(--spacing-xl);
		text-align: center;
	}

	.editor-main {
		display: grid;
		grid-template-columns: 1fr 1fr;
		flex: 1;
		overflow: hidden;
	}

	.editor-panel {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border);
		overflow: hidden;
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
	}

	.tab {
		padding: var(--spacing-sm) var(--spacing-lg);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
		background: var(--color-bg);
	}

	.tab-content {
		flex: 1;
		overflow: hidden;
	}

	.markdown-editor,
	.bibliography-editor {
		width: 100%;
		height: 100%;
		padding: var(--spacing-md);
		border: none;
		resize: none;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.markdown-editor:focus,
	.bibliography-editor:focus {
		outline: none;
	}

	.metadata-form {
		padding: var(--spacing-lg);
		overflow-y: auto;
		height: 100%;
	}

	.form-row {
		margin-bottom: var(--spacing-md);
	}

	.form-row label {
		display: block;
		font-weight: 500;
		margin-bottom: var(--spacing-xs);
		font-size: 0.875rem;
	}

	.form-row input {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	.form-row input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.preview-panel {
		display: flex;
		flex-direction: column;
		background: var(--color-bg-secondary);
		overflow: hidden;
	}

	.preview-header {
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		font-weight: 500;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.preview-content {
		flex: 1;
		padding: var(--spacing-xl);
		overflow-y: auto;
		background: white;
		max-width: 21cm;
		margin: var(--spacing-md);
		box-shadow: var(--shadow-md);
		font-family: var(--font-serif);
		line-height: 1.6;
	}

	.preview-content :global(h1) {
		font-size: 1.5em;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	.preview-content :global(h2) {
		font-size: 1.25em;
		margin-top: 1.25em;
	}

	.preview-content :global(h3) {
		font-size: 1.1em;
		margin-top: 1em;
	}

	.preview-content :global(p) {
		text-indent: 1.25cm;
		margin: 0 0 0.5em 0;
	}

	.preview-content :global(figure) {
		text-align: center;
		margin: 1em 0;
	}

	.preview-content :global(figcaption) {
		font-size: 0.9em;
		color: var(--color-text-secondary);
	}

	.preview-content :global(cite) {
		font-style: normal;
	}

	.preview-content :global(.references) {
		font-style: italic;
		color: var(--color-text-secondary);
	}

	.btn {
		padding: var(--spacing-xs) var(--spacing-md);
		border: none;
		border-radius: var(--radius-sm);
		font-weight: 500;
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

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

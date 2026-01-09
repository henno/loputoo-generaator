<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'general' | 'formatting' | 'sections' | 'templates'>('general');
	let isSaving = $state(false);
	let lastSaved = $state<Date | null>(null);
	let error = $state('');

	// Local state for editing
	let school = $state({ ...data.school });
	let files = $state({ ...data.files });

	// Auto-save timer
	let saveTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		// Track all changes
		const _ = [JSON.stringify(school), JSON.stringify(files)];
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => saveSchool(), 2000);
	});

	async function saveSchool() {
		if (isSaving) return;
		isSaving = true;
		error = '';

		try {
			const response = await fetch(`/api/schools/${data.school.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...school, files })
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
</script>

<svelte:head>
	<title>{school.name} seaded - Lõputöö Generaator</title>
</svelte:head>

<div class="school-settings">
	<header class="page-header">
		<div class="header-left">
			<a href="/schools" class="back-link">← Koolid</a>
			<h1>{school.name}</h1>
		</div>
		<div class="header-right">
			<span class="save-status">
				{#if isSaving}
					Salvestab...
				{:else if lastSaved}
					Salvestatud {lastSaved.toLocaleTimeString('et-EE')}
				{/if}
			</span>
			<a href="/api/schools/{data.school.id}/export" class="btn btn-secondary">Ekspordi JSON</a>
		</div>
	</header>

	{#if error}
		<div class="error-bar">{error}</div>
	{/if}

	<div class="settings-layout">
		<nav class="settings-nav">
			<button class:active={activeTab === 'general'} onclick={() => (activeTab = 'general')}>
				Üldine
			</button>
			<button class:active={activeTab === 'formatting'} onclick={() => (activeTab = 'formatting')}>
				Vormistus
			</button>
			<button class:active={activeTab === 'sections'} onclick={() => (activeTab = 'sections')}>
				Peatükid
			</button>
			<button class:active={activeTab === 'templates'} onclick={() => (activeTab = 'templates')}>
				Mallid
			</button>
		</nav>

		<div class="settings-content">
			{#if activeTab === 'general'}
				<section class="settings-section">
					<h2>Kooli andmed</h2>
					<div class="form-row">
						<label for="name">Kooli nimi</label>
						<input type="text" id="name" bind:value={school.name} />
					</div>
					<div class="form-row">
						<label for="shortName">Lühend</label>
						<input type="text" id="shortName" bind:value={school.shortName} />
					</div>
				</section>

				<section class="settings-section">
					<h2>Keel</h2>
					<div class="form-row two-col">
						<div>
							<label for="documentLang">Dokumendi keel</label>
							<input type="text" id="documentLang" bind:value={school.language.documentLang} />
						</div>
						<div>
							<label for="hyphenation">Poolitamine</label>
							<input type="text" id="hyphenation" bind:value={school.language.hyphenation} />
						</div>
					</div>
				</section>

				<section class="settings-section">
					<h2>Ristiviited (pandoc-crossref)</h2>
					<div class="form-row two-col">
						<div>
							<label for="figureTitle">Joonise pealkiri</label>
							<input type="text" id="figureTitle" bind:value={school.crossref.figureTitle} />
						</div>
						<div>
							<label for="tableTitle">Tabeli pealkiri</label>
							<input type="text" id="tableTitle" bind:value={school.crossref.tableTitle} />
						</div>
					</div>
				</section>
			{:else if activeTab === 'formatting'}
				<section class="settings-section">
					<h2>Dokumendi formaat</h2>
					<div class="form-row two-col">
						<div>
							<label for="documentClass">Dokumendiklass</label>
							<select id="documentClass" bind:value={school.formatting.documentClass}>
								<option value="report">report</option>
								<option value="article">article</option>
								<option value="book">book</option>
							</select>
						</div>
						<div>
							<label for="fontSize">Fondi suurus</label>
							<select id="fontSize" bind:value={school.formatting.fontSize}>
								<option value="10pt">10pt</option>
								<option value="11pt">11pt</option>
								<option value="12pt">12pt</option>
							</select>
						</div>
					</div>
				</section>

				<section class="settings-section">
					<h2>Fondid</h2>
					<div class="form-row two-col">
						<div>
							<label for="fontMain">Põhifont</label>
							<input type="text" id="fontMain" bind:value={school.formatting.font.main} />
						</div>
						<div>
							<label for="fontMono">Koodi font</label>
							<input type="text" id="fontMono" bind:value={school.formatting.font.mono} />
						</div>
					</div>
				</section>

				<section class="settings-section">
					<h2>Veerised</h2>
					<div class="form-row four-col">
						<div>
							<label for="marginTop">Ülemine</label>
							<input type="text" id="marginTop" bind:value={school.formatting.margins.top} />
						</div>
						<div>
							<label for="marginBottom">Alumine</label>
							<input type="text" id="marginBottom" bind:value={school.formatting.margins.bottom} />
						</div>
						<div>
							<label for="marginLeft">Vasak</label>
							<input type="text" id="marginLeft" bind:value={school.formatting.margins.left} />
						</div>
						<div>
							<label for="marginRight">Parem</label>
							<input type="text" id="marginRight" bind:value={school.formatting.margins.right} />
						</div>
					</div>
				</section>

				<section class="settings-section">
					<h2>Reavahe ja taanded</h2>
					<div class="form-row two-col">
						<div>
							<label for="lineSpacing">Reavahe</label>
							<input
								type="number"
								id="lineSpacing"
								bind:value={school.formatting.lineSpacing}
								step="0.1"
								min="1"
								max="3"
							/>
						</div>
						<div>
							<label for="firstLineIndent">Esimese rea taane</label>
							<input
								type="text"
								id="firstLineIndent"
								bind:value={school.formatting.firstLineIndent}
							/>
						</div>
					</div>
				</section>
			{:else if activeTab === 'sections'}
				<section class="settings-section">
					<h2>Sisukord</h2>
					<div class="form-row">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={school.tableOfContents.enabled} />
							Sisukord lubatud
						</label>
					</div>
					<div class="form-row two-col">
						<div>
							<label for="tocDepth">Sisukorra sügavus</label>
							<input
								type="number"
								id="tocDepth"
								bind:value={school.tableOfContents.depth}
								min="1"
								max="4"
							/>
						</div>
						<div>
							<label for="tocTitle">Sisukorra pealkiri</label>
							<input type="text" id="tocTitle" bind:value={school.tableOfContents.title} />
						</div>
					</div>
				</section>

				<section class="settings-section">
					<h2>Nummerdamata peatükid</h2>
					<p class="hint">Peatükid, mida ei nummerdata (üks rea kohta, väiketähtedega)</p>
					<textarea
						class="unnumbered-input"
						bind:value={school.sections.unnumberedSections}
						rows="6"
					></textarea>
				</section>
			{:else if activeTab === 'templates'}
				<section class="settings-section">
					<h2>LaTeX mall (template.tex)</h2>
					<textarea class="code-editor" bind:value={files.template} rows="20"></textarea>
				</section>

				<section class="settings-section">
					<h2>Viitamisstiil (style.csl)</h2>
					<textarea class="code-editor" bind:value={files.csl} rows="20"></textarea>
				</section>

				<section class="settings-section">
					<h2>Lua filter (structure.lua)</h2>
					<textarea class="code-editor" bind:value={files.filter} rows="20"></textarea>
				</section>
			{/if}
		</div>
	</div>
</div>

<style>
	.school-settings {
		height: calc(100vh - 60px);
		display: flex;
		flex-direction: column;
	}

	.page-header {
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

	.save-status {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.error-bar {
		background: #fef2f2;
		color: var(--color-error);
		padding: var(--spacing-sm) var(--spacing-xl);
	}

	.settings-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.settings-nav {
		display: flex;
		flex-direction: column;
		width: 200px;
		padding: var(--spacing-md);
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
	}

	.settings-nav button {
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
	}

	.settings-nav button:hover {
		background: var(--color-border);
	}

	.settings-nav button.active {
		background: var(--color-primary);
		color: white;
	}

	.settings-content {
		flex: 1;
		padding: var(--spacing-xl);
		overflow-y: auto;
	}

	.settings-section {
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.settings-section:last-child {
		border-bottom: none;
	}

	.settings-section h2 {
		font-size: 1.1rem;
		margin: 0 0 var(--spacing-md) 0;
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

	.form-row input,
	.form-row select {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.four-col {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-weight: normal;
	}

	.checkbox-label input {
		width: auto;
	}

	.hint {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.unnumbered-input,
	.code-editor {
		width: 100%;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		resize: vertical;
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

	.btn-secondary {
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-border);
		text-decoration: none;
	}
</style>

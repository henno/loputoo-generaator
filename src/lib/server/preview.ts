import { marked } from 'marked';

interface PreviewMetadata {
	title?: string;
	author?: string;
	[key: string]: unknown;
}

/**
 * Generate HTML preview from Markdown content
 * This is a simplified preview - not 100% identical to final PDF
 */
export async function generatePreview(
	markdown: string,
	metadata: PreviewMetadata
): Promise<string> {
	// Configure marked for our use case
	marked.setOptions({
		gfm: true,
		breaks: false
	});

	// Pre-process markdown for our custom syntax
	let processed = markdown;

	// Handle pandoc-crossref style references (@fig:, @tbl:, @sec:)
	processed = processed.replace(/@fig:(\w+)/g, '<em>joonis $1</em>');
	processed = processed.replace(/@tbl:(\w+)/g, '<em>tabel $1</em>');
	processed = processed.replace(/@sec:(\w+)/g, '<em>peatükk $1</em>');

	// Handle citation references [@key] -> (Autor, aasta)
	processed = processed.replace(/\[@([^\]]+)\]/g, '<cite>($1)</cite>');

	// Handle figure syntax ![caption](url){#fig:label width=80%}
	processed = processed.replace(
		/!\[([^\]]*)\]\(([^)]+)\)\{[^}]*\}/g,
		'<figure><img src="$2" alt="$1"><figcaption>$1</figcaption></figure>'
	);

	// Handle table captions : Caption {#tbl:label}
	processed = processed.replace(/^:\s*(.+)\s*\{[^}]*\}$/gm, '<caption>$1</caption>');

	// Handle .unnumbered class on headers
	processed = processed.replace(/^(#+\s+.+)\s*\{\.unnumbered\}\s*$/gm, '$1');
	processed = processed.replace(/^(#+\s+.+)\s*\{#[^}]+\}\s*$/gm, '$1');

	// Handle reference div
	processed = processed.replace(/::: \{#refs\}\s*:::/g, '<div class="references"><p><em>Kasutatud allikad ilmuvad siia</em></p></div>');

	// Handle \appendix
	processed = processed.replace(/\\appendix/g, '<hr class="appendix-divider"><p><strong>LISAD</strong></p>');

	// Convert to HTML
	const html = await marked.parse(processed);

	// Wrap with preview container and add title if available
	let result = '';

	if (metadata.title) {
		result += `<h1 class="title">${escapeHtml(metadata.title)}</h1>\n`;
	}

	if (metadata.author) {
		result += `<p class="author">${escapeHtml(metadata.author)}</p>\n`;
	}

	result += html;

	return result;
}

function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

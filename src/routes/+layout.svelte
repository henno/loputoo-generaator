<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="app">
	<nav class="navbar">
		<a href="/" class="logo">Lõputöö Generaator</a>
		<div class="nav-links">
			<a href="/projects">Projektid</a>
			<a href="/schools">Koolid</a>
		</div>
	</nav>

	<main class="main">
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.logo:hover {
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-lg);
	}

	.nav-links a {
		color: var(--color-text-secondary);
	}

	.nav-links a:hover {
		color: var(--color-primary);
		text-decoration: none;
	}

	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>

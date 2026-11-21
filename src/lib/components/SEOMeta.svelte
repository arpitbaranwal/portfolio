<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		path?: string;
	}

	let {
		title = '/home/valance',
		description = 'portfolio and personal blog',
		path = '/'
	}: Props = $props();

	const url = `https://valance.dev${path}`;
	const keywords =
		'Arpit, Arpit Baranwal, valance, valance.dev, developer, portfolio, AI/ML, python, backend, RAG, svelte';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content="Arpit Baranwal" />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content="valance.dev" />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Arpit Baranwal',
		alternateName: ['valance', 'arpitbaranwal'],
		url: 'https://valance.dev',
		sameAs: [
			'https://github.com/arpitbaranwal',
			'https://linkedin.com/in/arpitbaranwal2255',
			'https://instagram.com/_arpitbaranwal',
			'https://wakatime.com/@fb40e726-a127-41f8-8f39-3596a3f911bb'
		],
		jobTitle: 'Software Developer',
		knowsAbout: ['Rust', 'Python', 'TypeScript', 'Svelte', 'FastAPI', 'Full-Stack Development']
	})}<\/script>`}
</svelte:head>

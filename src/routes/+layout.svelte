<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';

	import 'bootstrap-icons/font/bootstrap-icons.min.css';
	import 'devicon/devicon.min.css';
	import favicon from '$lib/assets/dog.gif';
	import { dogFaviconFrames } from '$lib/assets/dogFaviconFrames';
	import Dock from '$lib/components/Dock.svelte';

	let { children } = $props();

	onMount(() => {
		const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
		if (!link || !dogFaviconFrames.length) return;

		let frameIdx = 0;
		const interval = setInterval(() => {
			frameIdx = (frameIdx + 1) % dogFaviconFrames.length;
			link.href = dogFaviconFrames[frameIdx];
		}, 100);

		return () => clearInterval(interval);
	});
</script>

<svelte:head><link rel="icon" type="image/png" href={dogFaviconFrames[0] || favicon} /></svelte:head>

<div class="relative min-h-[100dvh] w-full overflow-x-clip bg-black">
	{@render children()}
</div>

<Dock />

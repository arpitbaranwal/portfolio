<script>
	import { onMount } from 'svelte';

	import smoking_guy_img from '$lib/assets/background/smoking_guy.jpg';
	import CigaretteSmokeOverlay from '$lib/components/CigaretteSmokeOverlay.svelte';
	import StackMarquee from '$lib/components/StackMarquee.svelte';

	let visible = $state(false);
	let textVisible = $state(false);
	let subtitleVisible = $state(false);

	onMount(() => {
		setTimeout(() => (visible = true), 200);
		setTimeout(() => (textVisible = true), 900);
		setTimeout(() => (subtitleVisible = true), 1300);
	});
</script>

<section class="hero-shell">
	<div class="hero-scanlines pointer-events-none select-none" aria-hidden="true"></div>
	<div class="hero-grain pointer-events-none select-none" aria-hidden="true"></div>

	<div class="hero-logo select-none" class:hero-logo--in={visible} aria-hidden="true">
		/home/valance
	</div>

	<div class="hero-content" class:hero-content--in={textVisible}>
		<p class="hero-label select-none">// portfolio</p>
		<h1 class="hero-title select-none">VALANCE</h1>
		<p class="hero-sub" class:hero-sub--in={subtitleVisible}>
			Hi, I'm Arpit - an AI/ML, python and backend developer.<br />Interested in RAG
			pipelines, cloud systems and scalable APIs.
		</p>
		<div class="hero-cta-row" class:hero-cta-row--in={subtitleVisible}>
			<a href="/projects" class="hero-btn-primary">View Work</a>
			<a href="/contact" class="hero-btn-ghost">Get in touch →</a>
		</div>

		<div class="mt-8 md:mt-10 pointer-events-auto">
			<StackMarquee />
		</div>

		<div class="mt-6 w-fit rounded-lg bg-black/40 py-1.5 backdrop-blur-xl pointer-events-auto">
			<div class="flex items-center gap-2">
				<span class="text-xs text-white/70 sm:text-sm">made with</span>
				<span class="text-sm select-none sm:text-base">🫰</span>
				<span class="text-xs text-white/70 sm:text-sm">and</span>
				<i class="devicon-svelte-plain colored text-sm sm:text-base"></i>
				<span class="text-xs font-medium text-white sm:text-sm">Svelte</span>
			</div>
		</div>
	</div>

	<div
		class="hero-char-wrap pointer-events-none select-none"
		class:hero-char-wrap--in={visible}
	>
		<div
			class="relative flex h-auto w-full items-end justify-end pointer-events-none select-none md:h-full md:w-auto"
		>
			<img
				src={smoking_guy_img}
				alt=""
				class="hero-char-img pointer-events-none select-none"
				draggable="false"
				aria-hidden="true"
			/>

			<div
				class="hero-char-fade pointer-events-none select-none"
				aria-hidden="true"
			></div>
			<div
				class="hero-glitch-line hero-glitch-line-1 pointer-events-none select-none"
				aria-hidden="true"
			></div>
			<div
				class="hero-glitch-line hero-glitch-line-2 pointer-events-none select-none"
				aria-hidden="true"
			></div>

			<!-- EASTER_EGG_SMOKE_START -->
			<CigaretteSmokeOverlay />
			<!-- EASTER_EGG_SMOKE_END -->
		</div>
	</div>

	<div
		class="hero-accent-bar pointer-events-none select-none"
		class:hero-accent-bar--in={subtitleVisible}
		aria-hidden="true"
	></div>
</section>

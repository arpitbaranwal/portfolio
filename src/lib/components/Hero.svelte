<script lang="ts">
	import { onMount } from 'svelte';

	import smoking_guy_img from '$lib/assets/background/smoking_guy.jpg';
	import CigaretteSmokeOverlay from '$lib/components/CigaretteSmokeOverlay.svelte';
	import StackMarquee from '$lib/components/StackMarquee.svelte';

	let visible = $state(false);
	let textVisible = $state(false);
	let subtitleVisible = $state(false);
	let bubbleFlickerMode = $state<'none' | 'stutter' | 'surge'>('none');

	let flickerTimeout: ReturnType<typeof setTimeout> | null = null;
	let flickerAnimTimeout: ReturnType<typeof setTimeout> | null = null;

	function scheduleNextFlicker(delayMs: number) {
		if (typeof window === 'undefined') return;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		flickerTimeout = setTimeout(() => {
			// Randomly vary between quick electrical stutter (65%) and warm surge (35%)
			const mode = Math.random() < 0.65 ? 'stutter' : 'surge';
			bubbleFlickerMode = mode;
			const animDuration = mode === 'stutter' ? 850 : 1050;

			flickerAnimTimeout = setTimeout(() => {
				bubbleFlickerMode = 'none';
				// Subsequent triggers average 12-13s (11000ms - 15000ms)
				const nextDelay = 11000 + Math.random() * 4000;
				scheduleNextFlicker(nextDelay);
			}, animDuration);
		}, delayMs);
	}

	onMount(() => {
		setTimeout(() => (visible = true), 200);
		setTimeout(() => (textVisible = true), 900);
		setTimeout(() => (subtitleVisible = true), 1300);

		// Initial trigger around 6-9s after landing so visitors notice it
		const initialDelay = 6500 + Math.random() * 2500;
		scheduleNextFlicker(initialDelay);

		return () => {
			if (flickerTimeout) clearTimeout(flickerTimeout);
			if (flickerAnimTimeout) clearTimeout(flickerAnimTimeout);
		};
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
			class="relative flex h-auto w-full items-end justify-end bg-transparent pointer-events-none select-none md:h-full md:w-auto"
		>
			<img
				src={smoking_guy_img}
				alt=""
				class="hero-char-img pointer-events-none select-none"
				draggable="false"
				aria-hidden="true"
			/>

			<!-- Japanese Speech Bubble (ふはっ) Neon Glow Overlay -->
			<div
				class="pointer-events-none select-none absolute inset-0 z-[4]"
				class:bubble-glow--stutter={bubbleFlickerMode === 'stutter'}
				class:bubble-glow--surge={bubbleFlickerMode === 'surge'}
				style="opacity: 0;"
				aria-hidden="true"
			>
				<!-- Ambient Warm Amber Halo -->
				<div
					class="pointer-events-none select-none absolute inset-0"
					style="
						background: radial-gradient(ellipse 9.5% 12.5% at 23.6% 61.5%, rgba(255, 196, 108, 0.32) 0%, rgba(255, 180, 80, 0.14) 55%, transparent 100%);
						mix-blend-mode: screen;
						filter: blur(8px);
					"
				></div>

				<!-- Text & Outline Boost (Exact same smoking_guy.jpg masked strictly over speech bubble) -->
				<img
					src={smoking_guy_img}
					alt=""
					class="hero-bubble-boost pointer-events-none select-none absolute inset-0 h-full w-full object-contain md:object-right-bottom"
					style="
						mix-blend-mode: screen;
						filter: brightness(1.7) contrast(1.15) saturate(1.4) drop-shadow(0 0 8px rgba(255, 198, 110, 0.9));
						mask-image: radial-gradient(ellipse 8.5% 11.5% at 23.6% 61.5%, black 65%, transparent 100%);
						-webkit-mask-image: radial-gradient(ellipse 8.5% 11.5% at 23.6% 61.5%, black 65%, transparent 100%);
					"
					draggable="false"
					aria-hidden="true"
				/>
			</div>

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

<style>
	.bubble-glow--stutter {
		animation: bubble-flicker-stutter 850ms ease-out forwards;
	}

	.bubble-glow--surge {
		animation: bubble-flicker-surge 1050ms ease-out forwards;
	}

	@keyframes bubble-flicker-stutter {
		0% {
			opacity: 0;
		}
		8% {
			opacity: 0.95;
		}
		18% {
			opacity: 0.15;
		}
		32% {
			opacity: 1;
		}
		48% {
			opacity: 0.35;
		}
		64% {
			opacity: 0.85;
		}
		80% {
			opacity: 0.4;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes bubble-flicker-surge {
		0% {
			opacity: 0;
		}
		12% {
			opacity: 0.8;
		}
		24% {
			opacity: 0.25;
		}
		40% {
			opacity: 1;
		}
		62% {
			opacity: 0.85;
		}
		78% {
			opacity: 0.35;
		}
		100% {
			opacity: 0;
		}
	}
</style>

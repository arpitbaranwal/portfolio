<script lang="ts">
	import { onMount } from 'svelte';
	import eyes_bg from '$lib/assets/background/eyes_torn.jpg';
	import tobecontinued from '$lib/assets/tobecontinued.png';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { projects } from '$lib/data/projects';

	let visible = $state(false);

	onMount(() => {
		setTimeout(() => (visible = true), 200);
	});
</script>

<SEOMeta
	title="/home/valance/projects"
	description="projects and research engines by Arpit Baranwal"
	path="/projects"
/>

<div class="projects-bg-wrap md:hidden" class:projects-bg-wrap--in={visible}>
	<img src={eyes_bg} alt="" class="projects-bg-img bg-black opacity-35" aria-hidden="true" />
	<div class="projects-bg-fade"></div>
</div>

<div
	class="projects-bg-desktop"
	class:projects-bg-desktop--in={visible}
>
	<img src={eyes_bg} alt="" class="projects-bg-desktop-img" aria-hidden="true" />
	<div class="projects-bg-desktop-overlay"></div>
</div>

<div class="hero-scanlines" aria-hidden="true"></div>
<div class="hero-grain" aria-hidden="true"></div>

<div class="hero-logo" class:hero-logo--in={visible} aria-hidden="true">
	/home/valance/projects
</div>

<div class="relative z-10 flex min-h-[100dvh] flex-col px-5 pt-28 pb-32 lg:px-12 lg:pt-32 lg:pb-24">
	<h1
		class="mb-8 translate-y-2 opacity-0 transition-all duration-700 ease-out md:mb-10"
		class:translate-y-0={visible}
		class:opacity-100={visible}
		style="font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.8rem, 8vw, 7rem); line-height: 1; letter-spacing: 0.04em; transition-delay: 100ms;"
	>
		<span class="text-white">Pro</span><span style="-webkit-text-stroke: 2px #c8a96e; color: transparent;">jects</span>
	</h1>

	<div class="relative z-10 flex-1">
		<!-- 2x2 Project Grid (1-column on mobile) -->
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 md:px-20">
			{#each projects as project, i (project.id)}
				<div
					style="
						transform: {visible ? 'scale(1)' : 'scale(0.96)'};
						transition: transform 700ms cubic-bezier(0.34,1.56,0.64,1) {150 + i * 80}ms;
					"
				>
					<ProjectCard {project} index={i} />
				</div>
			{/each}
		</div>

		<div
			class="mt-8 flex justify-end opacity-0 transition-all duration-700 ease-out md:px-20"
			class:opacity-100={visible}
			style="transition-delay: {150 + projects.length * 80 + 200}ms;"
		>
			<img src={tobecontinued} alt="To Be Continued" class="w-44 opacity-80 md:w-72" />
		</div>
	</div>

	<div
		class="fixed bottom-0 left-0 z-20 h-px bg-linear-to-r from-[#c8a96e] to-transparent transition-[width] duration-1200 ease-out"
		class:w-0={!visible}
		class:w-[50%]={visible}
		style="transition-delay: 500ms;"
	></div>
</div>

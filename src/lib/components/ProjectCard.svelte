<script lang="ts">
	import type { Project } from '$lib/data/projects';

	interface Props {
		project: Project;
		index?: number;
	}

	let { project, index }: Props = $props();

	// Split title for condensed uppercase + hollow gold outline on final letter
	const fullTitle = $derived((project.title || '').trim().toUpperCase());
	const titlePrefix = $derived(fullTitle.slice(0, -1));
	const titleLastChar = $derived(fullTitle.slice(-1));
</script>

<article class="group relative flex h-full flex-col overflow-hidden rounded-2xl">
	<div class="absolute inset-0 bg-black/50 saturate-180 backdrop-blur-xl"></div>
	<div class="absolute inset-0 bg-linear-to-br from-[#c8a96e]/6 via-white/1.5 to-black/10"></div>
	<div
		class="absolute inset-0 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 ease-out group-hover:border-[#c8a96e]/25 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(200,169,110,0.08)]"
	></div>
	<div
		class="absolute top-0 right-[5%] left-[5%] h-px bg-linear-to-r from-transparent via-[#c8a96e]/35 to-transparent"
	></div>

	<div class="relative z-10 flex h-full flex-col">
		<!-- Top Preview Visual (Screenshot override or dynamic dark UI preview, constrained h-44 on mobile) -->
		{#if project.previewImage}
			<div class="relative h-44 w-full overflow-hidden border-b border-white/5 bg-black md:h-48">
				<img
					src={project.previewImage}
					alt={project.title}
					class="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
				/>
				<div class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80"></div>
			</div>
		{:else if project.previewType === 'terminal'}
			<!-- CONTEXT ENGINE: Code/Terminal Benchmark Preview -->
			<div
				class="relative flex h-44 w-full flex-col justify-between overflow-hidden border-b border-white/5 bg-[#0a0a0c]/90 p-3.5 font-mono text-[0.65rem] select-none md:h-48 md:p-4 md:text-[0.68rem]"
			>
				<div class="flex items-center justify-between border-b border-white/6 pb-2">
					<div class="flex items-center gap-1.5">
						<span class="h-2 w-2 rounded-full bg-red-500/70"></span>
						<span class="h-2 w-2 rounded-full bg-yellow-500/70"></span>
						<span class="h-2 w-2 rounded-full bg-green-500/70"></span>
						<span class="ml-2 text-[0.6rem] text-white/40 md:text-[0.62rem]">benchmark.sh — bm25f + faiss</span>
					</div>
					<span
						class="rounded bg-[#c8a96e]/10 px-1.5 py-0.5 text-[0.56rem] font-semibold tracking-wider text-[#c8a96e] md:text-[0.58rem]"
					>
						RAG EVAL
					</span>
				</div>

				<div class="my-auto space-y-1 leading-relaxed md:space-y-1.5">
					<div class="flex items-center justify-between text-white/60">
						<span class="text-white/40">corpus:</span>
						<span class="font-medium text-white/90">
							1,118 pages <span class="text-white/40">(620k tokens)</span>
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-white/40">avg_latency:</span>
						<span class="font-bold text-[#c8a96e]">22.97 ms</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-white/40">token_reduction:</span>
						<span class="font-bold text-emerald-400">99.72%</span>
					</div>
					<div class="mt-1.5 flex items-center justify-between border-t border-white/5 pt-1 text-[0.6rem] md:text-[0.62rem]">
						<span class="text-white/40">MRR@5: <strong class="text-white/90">0.92</strong></span>
						<span class="text-white/20">|</span>
						<span class="text-white/40">Recall@5: <strong class="text-white/90">0.89</strong></span>
						<span class="text-white/20">|</span>
						<span class="text-emerald-400/80">RRF: #1</span>
					</div>
				</div>

				<div class="pointer-events-none absolute inset-0 bg-radial from-[#c8a96e]/5 via-transparent to-transparent"></div>
			</div>
		{:else if project.previewType === 'dashboard'}
			<!-- SHIKSHAMAP: GeoAI Analytics Dashboard Preview -->
			<div
				class="relative flex h-44 w-full flex-col justify-between overflow-hidden border-b border-white/5 bg-[#0a0a0c]/90 p-3.5 font-mono text-[0.65rem] select-none md:h-48 md:p-4 md:text-[0.68rem]"
			>
				<div class="flex items-center justify-between border-b border-white/6 pb-2">
					<div class="flex items-center gap-1.5">
						<i class="bi bi-geo-alt-fill text-xs text-[#c8a96e]"></i>
						<span class="text-[0.6rem] tracking-wider text-white/60 uppercase md:text-[0.62rem]">District Risk Index</span>
					</div>
					<span
						class="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[0.56rem] font-semibold text-emerald-400 md:text-[0.58rem]"
					>
						52 Districts Mapped
					</span>
				</div>

				<div class="my-auto grid grid-cols-2 gap-2 text-[0.6rem] md:text-[0.62rem]">
					<div class="rounded-lg border border-white/5 bg-white/2 p-1.5 md:p-2">
						<div class="text-[0.56rem] text-white/40">Random Forest</div>
						<div class="text-xs font-bold text-[#c8a96e] md:text-sm">R² Score: 0.86</div>
					</div>
					<div class="rounded-lg border border-white/5 bg-white/2 p-1.5 md:p-2">
						<div class="text-[0.56rem] text-white/40">Mean Absolute Err</div>
						<div class="text-xs font-bold text-white/90 md:text-sm">MAE: 4.2%</div>
					</div>
				</div>

				<div class="space-y-1 md:space-y-1.5">
					<div>
						<div class="mb-0.5 flex justify-between text-[0.56rem] text-white/40 md:text-[0.58rem]">
							<span>Learning Poverty Index</span>
							<span class="text-[#c8a96e]">High Risk (78%)</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
							<div class="h-full rounded-full bg-linear-to-r from-[#c8a96e] to-amber-600" style="width: 78%;"></div>
						</div>
					</div>
					<div>
						<div class="mb-0.5 flex justify-between text-[0.56rem] text-white/40 md:text-[0.58rem]">
							<span>Infrastructure Deficit</span>
							<span class="text-white/60">Moderate (42%)</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
							<div class="h-full rounded-full bg-linear-to-r from-zinc-500 to-zinc-400" style="width: 42%;"></div>
						</div>
					</div>
				</div>
			</div>
		{:else if project.previewType === 'studio'}
			<!-- IMAGI: Diffusion Studio Preview -->
			<div
				class="relative flex h-44 w-full flex-col justify-between overflow-hidden border-b border-white/5 bg-[#0a0a0c]/90 p-3.5 font-mono text-[0.65rem] select-none md:h-48 md:p-4 md:text-[0.68rem]"
			>
				<div class="flex items-center justify-between border-b border-white/6 pb-2">
					<div class="flex items-center gap-1.5">
						<i class="bi bi-palette2 text-xs text-[#c8a96e]"></i>
						<span class="text-[0.6rem] tracking-wider text-white/60 uppercase md:text-[0.62rem]">Diffusion Studio</span>
					</div>
					<span class="rounded bg-white/5 px-1.5 py-0.5 text-[0.56rem] text-white/50 md:text-[0.58rem]">
						steps: 30 | cfg: 7.5
					</span>
				</div>

				<div class="my-auto rounded border border-white/10 bg-black/60 px-2.5 py-1.5 text-[0.6rem] md:py-2 md:text-[0.62rem]">
					<div class="flex items-center gap-1.5 text-white/80">
						<span class="font-bold text-[#c8a96e]">&gt; prompt:</span>
						<span class="truncate text-white/70">cinematic portrait, cybernetic deity, 8k, bokeh</span>
					</div>
				</div>

				<div class="grid grid-cols-6 gap-1 md:gap-1.5">
					{#each [0.1, 0.25, 0.42, 0.6, 0.8, 1.0] as progress, stepIdx}
						<div
							class="relative flex h-8 flex-col items-center justify-center overflow-hidden rounded border border-white/6 bg-white/2 md:h-9"
						>
							<div
								class="absolute inset-0 bg-linear-to-br from-[#c8a96e]/15 to-transparent"
								style="opacity: {progress};"
							></div>
							<span class="relative z-10 text-[0.5rem] text-white/50 md:text-[0.52rem]">T-{(5 - stepIdx) * 6}</span>
							<div
								class="relative z-10 mt-1 h-0.5 w-3/4 rounded-full bg-[#c8a96e]"
								style="opacity: {progress};"
							></div>
						</div>
					{/each}
				</div>
			</div>
		{:else if project.previewType === 'chat'}
			<!-- CAREPAL: Support Trace Preview -->
			<div
				class="relative flex h-44 w-full flex-col justify-between overflow-hidden border-b border-white/5 bg-[#0a0a0c]/90 p-3.5 font-mono text-[0.65rem] select-none md:h-48 md:p-4 md:text-[0.68rem]"
			>
				<div class="flex items-center justify-between border-b border-white/6 pb-2">
					<div class="flex items-center gap-1.5">
						<i class="bi bi-chat-left-dots text-xs text-[#c8a96e]"></i>
						<span class="text-[0.6rem] tracking-wider text-white/60 uppercase md:text-[0.62rem]">Support Trace</span>
					</div>
					<span
						class="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[0.56rem] font-semibold text-amber-400 md:text-[0.58rem]"
					>
						escalation: ready
					</span>
				</div>

				<div class="my-auto space-y-1 md:space-y-1.5">
					<div class="rounded border-l-2 border-[#c8a96e] bg-white/4 px-2 py-1 text-[0.6rem] text-white/80 md:px-2.5 md:py-1.5 md:text-[0.62rem]">
						<span class="mr-1 text-white/40">&gt; user:</span>"How do I configure custom webhook retries?"
					</div>

					<div class="flex items-center justify-between px-0.5 text-[0.58rem] md:text-[0.6rem]">
						<span class="text-white/40">hybrid_retriever</span>
						<span class="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-400">
							[vector_match: 0.94]
						</span>
					</div>

					<div class="line-clamp-2 rounded border border-white/5 bg-black/40 p-1.5 text-[0.58rem] leading-relaxed text-white/60 md:p-2 md:text-[0.6rem]">
						<span class="font-semibold text-emerald-400">grounded:</span> "Under Settings &gt; Webhooks, configure the exponential backoff policy..."
					</div>
				</div>
			</div>
		{:else}
			<div
				class="flex h-44 w-full items-center justify-center border-b border-white/5 bg-linear-to-br from-white/3 to-black/20 md:h-48"
			>
				<i class="bi bi-code-slash text-4xl text-[#c8a96e]/30"></i>
			</div>
		{/if}

		<!-- Card Body Content -->
		<div class="flex flex-1 flex-col gap-2.5 p-4 md:gap-3 md:p-5">
			<h2
				class="m-0 leading-tight tracking-[0.04em]"
				style="font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.3rem, 3.5vw, 1.8rem);"
			>
				<span class="text-white">{titlePrefix}</span><span
					style="-webkit-text-stroke: 1.5px #c8a96e; color: transparent;">{titleLastChar}</span
				>
			</h2>

			<p class="m-0 line-clamp-3 font-mono text-xs leading-5.5 text-white/50 md:leading-6">
				{project.description}
			</p>

			{#if project.tags && project.tags.length > 0}
				<div class="mt-1 flex flex-wrap gap-1.5">
					{#each project.tags as tag}
						<span
							class="rounded border border-[#c8a96e]/20 bg-[#c8a96e]/6 px-2 py-0.5 font-mono text-[0.6rem] tracking-wider text-[#c8a96e]/80"
						>
							#{tag}
						</span>
					{/each}
				</div>
			{/if}

			<div class="flex-1"></div>

			<!-- Bottom Actions: Code button with subtle golden edge glow on hover -->
			<div class="mt-1 flex items-center gap-2 border-t border-white/6 pt-3">
				{#if project.codeUrl && project.codeUrl.trim().length > 0}
					<a
						href={project.codeUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="group/code flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5
                               py-1.5 font-mono text-[0.65rem] tracking-wider text-white/70
                               no-underline transition-all duration-300 ease-out touch-manipulation
                               hover:border-[#c8a96e]/70 hover:bg-[#c8a96e]/[0.08] hover:text-[#c8a96e]
                               hover:shadow-[0_0_12px_rgba(200,169,110,0.35),inset_0_0_6px_rgba(200,169,110,0.15)]"
						style="-webkit-tap-highlight-color: transparent;"
						aria-label="{project.title} Code repository"
					>
						<i class="bi bi-github text-sm transition-colors duration-300 group-hover/code:text-[#c8a96e]"></i>
						<span>Code</span>
					</a>
				{/if}

				{#if project.docsUrl && project.docsUrl.trim().length > 0}
					<a
						href={project.docsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3
                               py-1.5 font-mono text-[0.65rem] tracking-wider text-white/60
                               no-underline transition-all duration-200 touch-manipulation hover:border-[#c8a96e]/40 hover:text-[#c8a96e]"
						style="-webkit-tap-highlight-color: transparent;"
						aria-label="{project.title} Documentation"
					>
						<i class="bi bi-book text-sm"></i>
						<span>Docs</span>
					</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Subtle monospace card index in bottom right corner (e.g. 01, 02, 03, 04) -->
	{#if index !== undefined}
		<span
			class="pointer-events-none absolute right-4 bottom-3 z-10 font-mono text-xs font-semibold tracking-wider text-white/10 transition-colors duration-300 group-hover:text-[#c8a96e]/25 select-none"
			aria-hidden="true"
		>
			{String(index + 1).padStart(2, '0')}
		</span>
	{/if}
</article>

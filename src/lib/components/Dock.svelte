<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let dockVisible = $state(false);
	let showResumeModal = $state(false);

	interface DockItem {
		id: string;
		type?: 'divider';
		icon?: string;
		label?: string;
		href?: string;
		external?: boolean;
		download?: boolean;
	}

	const items: DockItem[] = [
		{ id: 'home', icon: 'bi-house-fill', label: 'Home', href: '/' },
		{ id: 'project', icon: 'bi-code-slash', label: 'Projects', href: '/projects' },
		{ id: 'contact', icon: 'bi-send-fill', label: 'Contact', href: '/contact' },
		{
			id: 'resume',
			icon: 'bi-file-earmark-arrow-down-fill',
			label: 'Resume',
			href: '/resume.pdf'
		},
		{ id: 'div1', type: 'divider' },
		{
			id: 'github',
			icon: 'bi-github',
			label: 'GitHub',
			href: 'https://github.com/arpitbaranwal',
			external: true
		},
		{
			id: 'discord',
			icon: 'bi-discord',
			label: 'Discord',
			href: 'https://discord.com/users/911182045374472243',
			external: true
		},
		{
			id: 'linkedin',
			icon: 'bi-linkedin',
			label: 'LinkedIn',
			href: 'https://linkedin.com/in/arpitbaranwal2255',
			external: true
		},
		{ id: 'email', icon: 'bi-envelope-fill', label: 'Email', href: 'mailto:arpitbaranwal05@gmail.com' },
		{
			id: 'instagram',
			icon: 'bi-instagram',
			label: 'Instagram',
			href: 'https://instagram.com/_arpitbaranwal',
			external: true
		}
	];

	let hoveredId = $state<string | null>(null);

	// Tooltip positioned via JS to escape overflow clipping (strictly disabled on touch devices)
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipLabel = $state('');
	let tooltipVisible = $state(false);

	function showTooltip(e: MouseEvent, item: DockItem) {
		// Only display tooltips if pointer is fine (mouse desktop)
		if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
		hoveredId = item.id;
		tooltipLabel = item.label ?? '';
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		tooltipX = rect.left + rect.width / 2;
		tooltipY = rect.top - 8;
		tooltipVisible = true;
	}

	function hideTooltip() {
		hoveredId = null;
		tooltipVisible = false;
	}

	function handleItemClick(e: MouseEvent, item: DockItem) {
		if (item.id === 'resume') {
			e.preventDefault();
			hideTooltip();
			showResumeModal = true;
		}
	}

	function closeResumeModal() {
		showResumeModal = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showResumeModal) {
			closeResumeModal();
		}
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		if (showResumeModal) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});

	onMount(() => setTimeout(() => (dockVisible = true), 400));
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Fixed tooltip rendered at root level: strictly hidden on mobile touch screens -->
<div
	class="dock-tooltip pointer-events-none fixed z-[9999] hidden rounded border border-[#c8a96e]/25 bg-black/90 px-2
	       py-0.5 font-mono text-[0.6rem] tracking-widest whitespace-nowrap text-[#e8d5b0]
	       backdrop-blur-sm transition-opacity duration-150 md:block"
	style="left: {tooltipX}px; top: {tooltipY}px; transform: translateX(-50%) translateY(-100%); opacity: {tooltipVisible ? 1 : 0};"
>
	{tooltipLabel}
</div>

<nav
	class="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 transition-all duration-700 ease-out md:px-0"
	style="bottom: calc(16px + env(safe-area-inset-bottom, 0px));"
	class:opacity-0={!dockVisible}
	class:translate-y-6={!dockVisible}
	class:opacity-100={dockVisible}
	class:translate-y-0={dockVisible}
	aria-label="Site navigation dock"
>
	<div
		class="pointer-events-auto relative w-full max-w-[360px] rounded-full border
		       border-white/10 bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)]
		       saturate-180 backdrop-blur-2xl md:w-auto md:max-w-[calc(100vw-2rem)]"
	>
		<div class="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-[#c8a96e]/[0.07] via-white/2 to-black/10"></div>
		<div class="pointer-events-none absolute top-0 right-[8%] left-[8%] h-px rounded-full bg-linear-to-r from-transparent via-[#c8a96e]/40 to-transparent"></div>

		<div class="overflow-x-auto" style="scrollbar-width: none; -ms-overflow-style: none;">
			<ul class="relative m-0 flex list-none items-center justify-center gap-0.5 px-3 py-1.5 md:px-4" role="list">
				{#each items as item}
					{#if item.type === 'divider'}
						<li
							class="mx-1 h-5 w-px shrink-0 bg-linear-to-b from-transparent via-white/15 to-transparent md:mx-1.5"
							role="separator"
							aria-hidden="true"
						></li>
					{:else}
						<li
							class="relative flex flex-col items-center"
							onmouseenter={(e) => showTooltip(e, item)}
							onmouseleave={hideTooltip}
							role="listitem"
						>
							<a
								href={item.href}
								target={item.external ? '_blank' : undefined}
								rel={item.external ? 'noopener noreferrer' : undefined}
								download={item.download ? '' : undefined}
								onclick={(e) => handleItemClick(e, item)}
								class="relative flex h-9 w-9 min-h-[36px] min-w-[36px] touch-manipulation select-none items-center justify-center rounded-lg text-white/60 no-underline transition-colors hover:text-white"
								style="-webkit-tap-highlight-color: transparent;"
								aria-label={item.label}
							>
								<i class="bi {item.icon} relative z-10 text-[1.05rem] md:text-[1.1rem]" aria-hidden="true"></i>

								{#if $page.url.pathname === item.href}
									<span class="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#c8a96e] shadow-[0_0_5px_rgba(200,169,110,0.9)]"></span>
								{/if}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</nav>

{#if showResumeModal}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-labelledby="resume-modal-title"
	>
		<!-- Backdrop -->
		<div
			class="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
			onclick={closeResumeModal}
			role="presentation"
		></div>

		<!-- Dialog Window -->
		<div
			class="modal-window relative w-full max-w-md rounded-2xl border border-[#c8a96e]/30 bg-[#0d0d0d] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(200,169,110,0.08)]"
		>
			<!-- Top accent glow line -->
			<div
				class="pointer-events-none absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-[#c8a96e]/60 to-transparent"
			></div>

			<!-- Ambient gold blur -->
			<div
				class="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[#c8a96e]/10 blur-2xl"
			></div>

			<!-- Close button -->
			<button
				type="button"
				onclick={closeResumeModal}
				class="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
				aria-label="Close dialog"
			>
				<i class="bi bi-x-lg text-xs" aria-hidden="true"></i>
			</button>

			<!-- Header tag -->
			<div class="mb-1.5 flex items-center gap-2">
				<span class="inline-block h-1.5 w-1.5 rounded-full bg-[#c8a96e] animate-pulse"></span>
				<span class="font-mono text-[0.65rem] tracking-[0.25em] text-[#c8a96e] uppercase">// RESUME ACCESS</span>
			</div>

			<h3 id="resume-modal-title" class="font-mono text-lg font-bold tracking-wide text-white">
				Download Resume?
			</h3>

			<p class="mt-2 text-xs leading-relaxed text-[#9a9a9a]">
				Would you like to download Arpit Baranwal's resume or preview it in a new tab?
			</p>

			<!-- File preview chip -->
			<div class="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#c8a96e]/30 bg-[#c8a96e]/10 text-[#c8a96e]"
				>
					<i class="bi bi-file-earmark-pdf-fill text-xl" aria-hidden="true"></i>
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate font-mono text-xs font-semibold text-white">resume.pdf</div>
					<div class="font-mono text-[0.7rem] text-white/40">PDF Document • 186 KB</div>
				</div>
				<span
					class="shrink-0 rounded border border-[#c8a96e]/30 bg-[#c8a96e]/10 px-2 py-0.5 font-mono text-[0.65rem] font-medium tracking-wider text-[#c8a96e] uppercase"
				>
					Ready
				</span>
			</div>

			<!-- Actions -->
			<div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
				<a
					href="/resume.pdf"
					target="_blank"
					rel="noopener noreferrer"
					onclick={closeResumeModal}
					class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-white uppercase transition hover:-translate-y-0.5 hover:border-[#c8a96e] hover:bg-[#c8a96e]/10 hover:text-[#c8a96e]"
				>
					<i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
					<span>Preview</span>
				</a>

				<a
					href="/resume.pdf"
					download="Arpit_Baranwal_Resume.pdf"
					onclick={closeResumeModal}
					class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8a96e] px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-black uppercase transition hover:-translate-y-0.5 hover:bg-[#e0c48a] hover:shadow-[0_0_15px_rgba(200,169,110,0.35)]"
				>
					<i class="bi bi-download" aria-hidden="true"></i>
					<span>Download</span>
				</a>
			</div>

			<div class="mt-3 text-center">
				<button
					type="button"
					onclick={closeResumeModal}
					class="font-mono text-[0.75rem] tracking-wider text-white/40 transition hover:text-white"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	div::-webkit-scrollbar {
		display: none;
	}

	.modal-window {
		animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes modalIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@media (hover: none) or (pointer: coarse) {
		:global(.dock-tooltip) {
			display: none !important;
		}
	}
</style>

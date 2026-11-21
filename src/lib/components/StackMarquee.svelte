<script lang="ts">
	import { onMount } from 'svelte';

	interface TechIcon {
		name: string;
		class?: string;
		colored?: boolean;
		svg?: string;
	}

	const icons: TechIcon[] = [
		// Languages (5)
		{ name: 'Python', class: 'devicon-python-plain', colored: true },
		{ name: 'JavaScript', class: 'devicon-javascript-plain', colored: true },
		{ name: 'SQL', class: 'devicon-azuresqldatabase-plain' },
		{ name: 'HTML5', class: 'devicon-html5-plain', colored: true },
		{ name: 'CSS3', class: 'devicon-css3-plain', colored: true },

		// Frameworks & Web Libraries (6)
		{ name: 'FastAPI', class: 'devicon-fastapi-plain', colored: true },
		{ name: 'React', class: 'devicon-react-original', colored: true },
		{ name: 'Svelte', class: 'devicon-svelte-plain', colored: true },
		{ name: 'Streamlit', class: 'devicon-streamlit-plain', colored: true },
		{ name: 'Tailwind CSS', class: 'devicon-tailwindcss-plain', colored: true },
		{ name: 'Vite', class: 'devicon-vitejs-plain', colored: true },

		// AI / ML & Data (7)
		{
			name: 'RAG Architecture',
			svg: `<svg viewBox="0 0 32 32" class="h-6 w-6 md:h-7 md:w-7" fill="none"><defs><linearGradient id="rag-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c8a96e"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient></defs><ellipse cx="10" cy="8" rx="6" ry="2.2" stroke="#c8a96e" stroke-width="1.4" fill="none"/><path d="M4 8v5c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2V8" stroke="#c8a96e" stroke-width="1.4" fill="none"/><path d="M4 13v5c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2V13" stroke="#c8a96e" stroke-width="1.4" fill="none"/><path d="M17 13.5h5l-2-2m2 2l-2 2" stroke="url(#rag-grad)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 8c0 2.5-1.8 4.2-4.2 4.2 2.4 0 4.2 1.7 4.2 4.2 0-2.5 1.8-4.2 4.2-4.2-2.4 0-4.2-1.7-4.2-4.2z" fill="#38bdf8"/><text x="16" y="29.5" text-anchor="middle" font-size="7.5" font-weight="900" font-family="monospace" fill="#c8a96e" letter-spacing="1">RAG</text></svg>`
		},
		{ name: 'PyTorch', class: 'devicon-pytorch-original', colored: true },
		{ name: 'Scikit-Learn', class: 'devicon-scikitlearn-plain', colored: true },
		{
			name: 'Hugging Face',
			svg: `<svg viewBox="0 0 32 32" class="h-6 w-6 md:h-7 md:w-7" fill="none"><circle cx="16" cy="16" r="14" fill="#FFD21E"/><ellipse cx="11.5" cy="13.5" rx="1.8" ry="2.2" fill="#202020"/><ellipse cx="20.5" cy="13.5" rx="1.8" ry="2.2" fill="#202020"/><circle cx="9" cy="17" r="2.2" fill="#FFA726" opacity="0.6"/><circle cx="23" cy="17" r="2.2" fill="#FFA726" opacity="0.6"/><path d="M11 18c1.2 3 8.8 3 10 0" stroke="#202020" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M5 23c2-2 5-1 6 1" stroke="#202020" stroke-width="1.6" stroke-linecap="round" fill="#FFD21E"/><path d="M27 23c-2-2-5-1-6 1" stroke="#202020" stroke-width="1.6" stroke-linecap="round" fill="#FFD21E"/></svg>`
		},
		{
			name: 'FAISS',
			svg: `<svg viewBox="0 0 32 32" class="h-6 w-6 md:h-7 md:w-7" fill="none"><defs><linearGradient id="meta-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0064e0"/><stop offset="100%" stop-color="#0082fb"/></linearGradient></defs><path d="M7.5 10.5C4.5 10.5 2 13 2 16s2.5 5.5 5.5 5.5c3.2 0 5.4-2.8 7.3-5.3.8-1 1.7-2.2 2.7-3.1 2.2-2.1 4.5-2.6 6.5-2.6 3.5 0 6 2.5 6 5.5s-2.5 5.5-6 5.5c-2.3 0-4.3-1.1-6.2-3.2-.8-.9-1.6-1.9-2.3-2.8-1.9-2.5-4.2-5-7.5-5zm0 2.2c1.9 0 3.5 1.7 5.1 3.6.7.9 1.5 1.8 2.2 2.7 1.4 1.6 3 2.5 4.7 2.5 2.2 0 3.8-1.5 3.8-3.3s-1.6-3.3-3.8-3.3c-1.3 0-2.8.5-4.4 2.1-.9.9-1.8 2-2.5 2.9-1.6 2-3.3 3.6-5.1 3.6-2 0-3.3-1.5-3.3-3.3s1.3-3.5 3.3-3.5z" fill="url(#meta-grad)"/><text x="16" y="29.5" text-anchor="middle" font-size="7.5" font-weight="900" font-family="monospace" fill="#0082fb" letter-spacing="0.5">FAISS</text></svg>`
		},
		{
			name: 'Gemini API',
			svg: `<svg viewBox="0 0 24 24" class="h-6 w-6 md:h-7 md:w-7" fill="none"><defs><linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1ba0f2"/><stop offset="50%" stop-color="#9353d3"/><stop offset="100%" stop-color="#f55"/></linearGradient></defs><path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" fill="url(#gemini-grad)"/></svg>`
		},
		{ name: 'pandas', class: 'devicon-pandas-plain', colored: true },
		{ name: 'NumPy', class: 'devicon-numpy-plain', colored: true },
		{ name: 'Matplotlib', class: 'devicon-matplotlib-plain', colored: true },
		{ name: 'Jupyter', class: 'devicon-jupyter-plain', colored: true },

		// Cloud & Backend (4)
		{ name: 'AWS', class: 'devicon-amazonwebservices-plain-wordmark', colored: true },
		{ name: 'Cloudflare', class: 'devicon-cloudflare-plain', colored: true },
		{ name: 'SQLAlchemy', class: 'devicon-sqlalchemy-plain', colored: true },
		{
			name: 'Pydantic',
			svg: `<svg viewBox="0 0 32 32" class="h-6 w-6 md:h-7 md:w-7" fill="none"><defs><linearGradient id="pydantic-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF3366"/><stop offset="100%" stop-color="#E92063"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="7" fill="url(#pydantic-grad)"/><path d="M11 9h6a5 5 0 0 1 5 5c0 2.8-2.2 5-5 5h-3v5h-3V9zm3 3v4h3a2 2 0 1 0 0-4h-3z" fill="#ffffff"/></svg>`
		},

		// Developer Tools & Design (3)
		{ name: 'GitHub', class: 'devicon-github-original' },
		{ name: 'VS Code', class: 'devicon-vscode-plain', colored: true },
		{ name: 'Figma', class: 'devicon-figma-plain', colored: true }
	];

	let isMobile: boolean = $state(false);

	const pageSize = $derived(isMobile ? 5 : 7);
	const totalPages = $derived(Math.ceil(icons.length / pageSize));

	function getPage(i: number, size: number, total: number): TechIcon[] {
		if (total <= 0) return [];
		const start = ((i % total) + total) % total;
		return icons.slice(start * size, (start + 1) * size);
	}

	let pageIndex: number = $state(0);
	let animating: boolean = $state(false);

	let phase: 'idle' | 'exit' | 'enter' = $state('idle');
	let displayPage: TechIcon[] = $derived(getPage(pageIndex, pageSize, totalPages));

	function changePage(next: number): void {
		if (animating || next === pageIndex) return;
		animating = true;

		phase = 'exit';

		setTimeout(
			() => {
				pageIndex = next;
				phase = 'enter';

				setTimeout(
					() => {
						phase = 'idle';
						animating = false;
					},
					360 + pageSize * 35
				);
			},
			260 + pageSize * 30
		);
	}

	function slide(dir: 'left' | 'right'): void {
		const next =
			dir === 'left' ? (pageIndex + 1) % totalPages : (pageIndex - 1 + totalPages) % totalPages;
		changePage(next);
	}

	let timer: ReturnType<typeof setInterval>;

	onMount(() => {
		const updateLayout = () => {
			const mobile = window.innerWidth < 768;
			if (mobile !== isMobile) {
				isMobile = mobile;
				pageIndex = 0;
			}
		};

		updateLayout();
		window.addEventListener('resize', updateLayout);

		timer = setInterval(() => slide('left'), 3400);

		return () => {
			window.removeEventListener('resize', updateLayout);
			clearInterval(timer);
		};
	});

	function restartTimer(): void {
		clearInterval(timer);
		timer = setInterval(() => slide('left'), 3400);
	}

	function iconStyle(i: number): string {
		const delay = i * 32;
		const base = `transition: opacity 280ms ease ${delay}ms, transform 280ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms;`;
		if (phase === 'exit') {
			return base + 'opacity: 0; transform: translateY(8px) scale(0.85);';
		}
		if (phase === 'enter') {
			return base + 'opacity: 1; transform: translateY(0) scale(1);';
		}
		return 'opacity: 1; transform: translateY(0) scale(1); transition: none;';
	}
</script>

<div class="relative w-full select-none" aria-label="Technology stack">
	<!-- Responsive grid: 5 uniform tiles on mobile (<768px), 7 tiles on desktop (>=768px) -->
	<div class="grid w-full grid-cols-5 gap-2.5 py-2 md:grid-cols-7 md:gap-3">
		{#each displayPage as tech, i (tech.name)}
			<div
				class="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#0D0D0D] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
				style={iconStyle(i)}
			>
				<div class="absolute inset-0 bg-black/60 saturate-180 backdrop-blur-xl"></div>
				<div
					class="absolute inset-0 bg-linear-to-br from-[#c8a96e]/6 via-white/1.5 to-black/10"
				></div>
				<div
					class="absolute top-0 right-[10%] left-[10%] h-px rounded-full bg-linear-to-r from-transparent via-white/20 to-transparent"
				></div>
				<div class="relative z-10 flex h-full w-full items-center justify-center p-1 md:p-1.5">
					{#if tech.svg}
						<div
							class="flex h-6 w-6 items-center justify-center md:h-7 md:w-7"
							title={tech.name}
							aria-label={tech.name}
						>
							{@html tech.svg}
						</div>
					{:else}
						<i
							class="{tech.class} {tech.colored ? 'colored' : ''} text-[1.4rem] md:text-[1.75rem]"
							style={!tech.colored ? 'color: rgba(255,255,255,0.5)' : ''}
							title={tech.name}
							aria-label={tech.name}
						></i>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Gold pagination dashes synced to total pages -->
	<div class="mt-3 flex gap-1.5">
		{#each Array(totalPages) as _, i}
			<button
				class="h-px cursor-pointer rounded-full border-0 p-0 transition-all duration-300
               {i === pageIndex ? 'w-6 bg-[#c8a96e]' : 'w-3 bg-white/20 hover:bg-white/35'}"
				onclick={() => {
					changePage(i);
					restartTimer();
				}}
				aria-label="Page {i + 1}"
			></button>
		{/each}
	</div>
</div>

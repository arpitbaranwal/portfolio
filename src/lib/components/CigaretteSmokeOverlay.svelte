<script lang="ts">
	import { onMount } from 'svelte';

	// Top-level percentage coordinates for the cigarette tip hotspot (exact center on natural 764x1024 image)
	export const TIP_X = 16.36; // % from left of character artwork
	export const TIP_Y = 44.92; // % from top of character artwork
	export const DEBUG_TIP = false; // When true, displays 1px red dashed ring and logs clicked %

	// State machine: strictly starts in 'idle' on page load
	type Phase = 'idle' | 'lighting' | 'smoking' | 'dissolving';
	let phase: Phase = $state('idle');

	// Visual heat, opacity & displacement state
	let emberHeat = $state(0); // 0 to 1
	let emberFlickerScale = $state(1); // 0.94 to 1.06
	let fumeOpacity = $state(0); // 0 to 1
	let dispScale = $state(28); // Dynamic turbulence displacement scale (24 - 38)

	// Timing trackers
	let lightingStartTime = 0;
	let dissolvingStartTime = 0;
	let mobileBurstTimer: ReturnType<typeof setTimeout> | null = null;
	let cancelCooldownTimer: ReturnType<typeof setTimeout> | null = null;

	let animId: number | null = null;
	let isLoopRunning = false;

	interface Ribbon {
		id: number;
		type: 'core' | 'mid' | 'veil';
		stroke: string;
		width: number;
		baseOpacity: number;
		speed: number;
		freq1: number;
		freq2: number;
		amp: number;
		windBias: number;
		phase1: number;
		phase2: number;
		cycleDuration: number;
		cycleStart: number;
		d: string;
	}

	function createRibbon(id: number, type: 'core' | 'mid' | 'veil', now: number): Ribbon {
		if (type === 'core') {
			return {
				id,
				type,
				stroke: Math.random() > 0.4 ? '#FFFFFF' : '#F6F3ED',
				width: 2.6 + Math.random() * 1.4, // 2.6px - 4.0px
				baseOpacity: 0.72 + Math.random() * 0.12, // 0.72 - 0.84 for crisp, unmistakable core visibility
				speed: 0.0034 + Math.random() * 0.0014,
				freq1: 0.024 + Math.random() * 0.012,
				freq2: 0.052 + Math.random() * 0.022,
				amp: 7 + Math.random() * 6,
				windBias: -12 - Math.random() * 10, // Natural upward-left drift
				phase1: Math.random() * Math.PI * 2,
				phase2: Math.random() * Math.PI * 2,
				cycleDuration: 2800 + Math.random() * 1400,
				cycleStart: now,
				d: ''
			};
		} else if (type === 'mid') {
			return {
				id,
				type,
				stroke: '#EDEAE3',
				width: 7.5 + Math.random() * 4.5, // 7.5px - 12.0px
				baseOpacity: 0.42 + Math.random() * 0.1, // 0.42 - 0.52 for rich silky body
				speed: 0.0022 + Math.random() * 0.0011,
				freq1: 0.016 + Math.random() * 0.01,
				freq2: 0.038 + Math.random() * 0.016,
				amp: 13 + Math.random() * 9,
				windBias: -14 - Math.random() * 12,
				phase1: Math.random() * Math.PI * 2,
				phase2: Math.random() * Math.PI * 2,
				cycleDuration: 3400 + Math.random() * 1600,
				cycleStart: now,
				d: ''
			};
		} else {
			return {
				id,
				type,
				stroke: '#DBD5CA',
				width: 18.0 + Math.random() * 6.0, // 18.0px - 24.0px
				baseOpacity: 0.22 + Math.random() * 0.06, // 0.22 - 0.28 for soft ambient plume
				speed: 0.0016 + Math.random() * 0.0008,
				freq1: 0.012 + Math.random() * 0.007,
				freq2: 0.026 + Math.random() * 0.012,
				amp: 16 + Math.random() * 8,
				windBias: -15 - Math.random() * 10,
				phase1: Math.random() * Math.PI * 2,
				phase2: Math.random() * Math.PI * 2,
				cycleDuration: 4200 + Math.random() * 1800,
				cycleStart: now,
				d: ''
			};
		}
	}

	function reRandomizeRibbon(r: Ribbon, now: number) {
		const fresh = createRibbon(r.id, r.type, now);
		r.stroke = fresh.stroke;
		r.width = fresh.width;
		r.baseOpacity = fresh.baseOpacity;
		r.speed = fresh.speed;
		r.freq1 = fresh.freq1;
		r.freq2 = fresh.freq2;
		r.amp = fresh.amp;
		r.windBias = fresh.windBias;
		r.phase1 = fresh.phase1;
		r.phase2 = fresh.phase2;
		r.cycleDuration = fresh.cycleDuration;
		r.cycleStart = now;
	}

	// 7 independent overlapping ribbons: 3 core tendrils, 3 mid wisps, 1 soft outer haze veil
	let ribbons: Ribbon[] = $state([
		createRibbon(0, 'core', 0),
		createRibbon(1, 'core', 120),
		createRibbon(2, 'core', 200),
		createRibbon(3, 'mid', 280),
		createRibbon(4, 'mid', 380),
		createRibbon(5, 'mid', 480),
		createRibbon(6, 'veil', 600)
	]);

	function buildSmoothPath(points: { x: number; y: number }[]): string {
		if (points.length < 2) return '';
		let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
		for (let i = 1; i < points.length - 1; i++) {
			const xc = (points[i].x + points[i + 1].x) / 2;
			const yc = (points[i].y + points[i + 1].y) / 2;
			d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
		}
		const last = points[points.length - 1];
		d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
		return d;
	}

	function startAnimationLoop() {
		if (isLoopRunning) return;
		isLoopRunning = true;
		animId = requestAnimationFrame(loop);
	}

	function stopAnimationLoop() {
		if (animId) {
			cancelAnimationFrame(animId);
			animId = null;
		}
		isLoopRunning = false;
	}

	function loop(timestamp: number) {
		if (phase === 'idle') {
			stopAnimationLoop();
			return;
		}

		// State 1: 3.5s Lighting ramp-up (exact ease-in curve + heat flicker)
		if (phase === 'lighting') {
			const elapsed = timestamp - lightingStartTime;
			const t = Math.min(1, elapsed / 3500);
			const ease = Math.pow(t, 2.2);
			let heat = ease;

			if (elapsed > 2500) {
				// Realistic heat flicker during the last 1000ms
				const flicker = Math.sin(timestamp * 0.035) * 0.07 + Math.cos(timestamp * 0.05) * 0.04;
				heat = Math.min(1, Math.max(0, heat + flicker));
				emberFlickerScale = 1 + Math.sin(timestamp * 0.04) * 0.06;
			} else {
				emberFlickerScale = 1;
			}

			emberHeat = heat;
			fumeOpacity = 0; // Strictly zero fumes during the 3.5s lighting phase

			if (elapsed >= 3500) {
				// Exact 3.5s elapses: ignite cigarette and begin continuous fumes
				phase = 'smoking';
				emberHeat = 1;
				fumeOpacity = 1;
			}
		}

		// State 2: Smoking continuous emission
		else if (phase === 'smoking') {
			emberHeat = 0.92 + Math.sin(timestamp * 0.025) * 0.08;
			emberFlickerScale = 1 + Math.sin(timestamp * 0.03) * 0.05;
			fumeOpacity = 1;
		}

		// State 3: Exactly 1.3s gradual dissolve
		else if (phase === 'dissolving') {
			const elapsed = timestamp - dissolvingStartTime;
			const progress = Math.min(1, elapsed / 1300);
			const fade = 1 - progress;

			fumeOpacity = fade;
			emberHeat = fade;
			emberFlickerScale = 1;

			if (elapsed >= 1300) {
				phase = 'idle';
				fumeOpacity = 0;
				emberHeat = 0;
				stopAnimationLoop();
				return;
			}
		}

		// Generate organic fume ribbons when smoking or dissolving
		if (phase === 'smoking' || phase === 'dissolving') {
			const prefersReducedMotion =
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!prefersReducedMotion) {
				// Subtly drift turbulence displacement scale (24 - 38)
				dispScale = 29 + Math.sin(timestamp * 0.0011) * 5.5 + Math.cos(timestamp * 0.0021) * 3;

				const stepCount = 30;
				const stepY = (250 - 10) / stepCount;

				for (let rIdx = 0; rIdx < ribbons.length; rIdx++) {
					const r = ribbons[rIdx];

					// Check if ribbon has completed its cycle; re-randomize if so
					if (timestamp - r.cycleStart > r.cycleDuration) {
						reRandomizeRibbon(r, timestamp);
					}

					const points: { x: number; y: number }[] = [];
					for (let step = 0; step <= stepCount; step++) {
						const y = 250 - step * stepY;
						const dist = 250 - y; // 0 at tip, 240 at top
						const distNorm = dist / 240;

						// Tightly bound at tip (distNorm -> 0), expanding naturally as it rises
						const curlScale = Math.pow(distNorm, 0.82);
						const sway1 =
							Math.sin(dist * r.freq1 + timestamp * r.speed + r.phase1) * (r.amp * curlScale);
						const sway2 =
							Math.sin(dist * r.freq2 - timestamp * r.speed * 0.65 + r.phase2) *
							(r.amp * 0.38 * curlScale);
						const drift = r.windBias * Math.pow(distNorm, 1.25);

						const x = 90 + drift + sway1 + sway2;
						points.push({ x, y });
					}
					r.d = buildSmoothPath(points);
				}
			}
		}

		animId = requestAnimationFrame(loop);
	}

	function handlePointerEnter(e: PointerEvent) {
		if (e.pointerType === 'mouse') {
			if (cancelCooldownTimer) {
				clearTimeout(cancelCooldownTimer);
				cancelCooldownTimer = null;
			}

			// Desktop: start exact 3.5s lighting ramp-up
			phase = 'lighting';
			lightingStartTime = performance.now();
			fumeOpacity = 0;
			startAnimationLoop();
		}
	}

	function handlePointerLeave(e: PointerEvent) {
		if (e.pointerType === 'mouse') {
			if (phase === 'lighting') {
				// Canceled before 3.5s: cool down ember over 500ms, emit zero fumes
				phase = 'idle';
				fumeOpacity = 0;
				emberHeat = 0;
				emberFlickerScale = 1;
				stopAnimationLoop();
			} else if (phase === 'smoking') {
				// Finished smoking: transition to exact 1.3s gradual dissolve
				phase = 'dissolving';
				dissolvingStartTime = performance.now();
			}
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.pointerType === 'touch' || e.pointerType === 'pen') {
			if (mobileBurstTimer) clearTimeout(mobileBurstTimer);
			if (cancelCooldownTimer) clearTimeout(cancelCooldownTimer);

			// Mobile: quick flare (400ms), 3500ms fumes, then 1300ms dissolve
			phase = 'smoking';
			emberHeat = 1;
			fumeOpacity = 1;
			startAnimationLoop();

			mobileBurstTimer = setTimeout(() => {
				phase = 'dissolving';
				dissolvingStartTime = performance.now();
			}, 3500);
		}
	}

	function handleDebugClick(e: MouseEvent) {
		if (!DEBUG_TIP) return;
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		console.log(
			`[CigaretteSmokeOverlay DEBUG] Clicked at TIP_X: ${x.toFixed(2)}%, TIP_Y: ${y.toFixed(2)}%`
		);
	}

	onMount(() => {
		// Strict guarantee: on page load, 100% idle, zero smoke, zero ember glow, zero timers
		phase = 'idle';
		emberHeat = 0;
		fumeOpacity = 0;

		return () => {
			stopAnimationLoop();
			if (mobileBurstTimer) clearTimeout(mobileBurstTimer);
			if (cancelCooldownTimer) clearTimeout(cancelCooldownTimer);
		};
	});
</script>

<!-- Real Cigarette Fumes rendered via SVG Turbulence & Displacement Filter (Zero bubbles, zero circles) -->
<svg
	class="pointer-events-none select-none absolute z-[6]"
	style="
		left: calc({TIP_X}% - 90px);
		top: calc({TIP_Y}% - 250px);
		width: 180px;
		height: 260px;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		opacity: {fumeOpacity};
		transition: opacity {phase === 'smoking' ? '400ms' : phase === 'dissolving' ? '1300ms' : '200ms'} ease-out;
	"
	viewBox="0 0 180 260"
	aria-hidden="true"
>
	<defs>
		<!-- SVG displacement filter simulating atmospheric smoke turbulence -->
		<filter
			id="cig-fume-filter"
			filterUnits="userSpaceOnUse"
			x="-50"
			y="-50"
			width="280"
			height="360"
		>
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.014 0.028"
				numOctaves="3"
				seed="7"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale={dispScale}
				xChannelSelector="R"
				yChannelSelector="G"
				result="displaced"
			/>
			<feGaussianBlur in="displaced" stdDeviation="1.15" />
		</filter>

		<!-- Smooth vertical fade mask so fumes emerge seamlessly from tip and feather cleanly at boundaries -->
		<linearGradient id="cig-fume-mask-v" x1="0" y1="260" x2="0" y2="0" gradientUnits="userSpaceOnUse">
			<stop offset="0%" stop-color="black" />
			<stop offset="2%" stop-color="black" />
			<stop offset="7%" stop-color="white" />
			<stop offset="78%" stop-color="white" />
			<stop offset="92%" stop-color="rgba(255,255,255,0.5)" />
			<stop offset="100%" stop-color="black" />
		</linearGradient>

		<mask id="cig-fume-mask">
			<rect x="0" y="0" width="180" height="260" fill="url(#cig-fume-mask-v)" />
		</mask>
	</defs>

	<!-- Continuous curling fume ribbons (7 overlapping paths with enhanced contrast and silky presence) -->
	<g mask="url(#cig-fume-mask)">
		<g filter="url(#cig-fume-filter)" class="drop-shadow-[0_0_6px_rgba(255,255,255,0.18)]">
			{#each ribbons as ribbon (ribbon.id)}
				<path
					d={ribbon.d}
					fill="none"
					stroke={ribbon.stroke}
					stroke-width={ribbon.width}
					stroke-opacity={ribbon.baseOpacity}
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/each}
		</g>
	</g>
</svg>

<!-- Organic Soft Heat Bloom (Zero visible circular edge, zero donut ring, natural glowing cherry ash) -->
<div
	class="pointer-events-none select-none absolute z-[7] -translate-x-1/2 -translate-y-1/2"
	style="
		left: {TIP_X}%;
		top: {TIP_Y}%;
		width: 32px;
		height: 32px;
		mix-blend-mode: screen;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
	"
	aria-hidden="true"
>
	<!-- Wide, very faint ambient warmth (blur 14px, max 0.28 opacity) -->
	<div
		class="pointer-events-none select-none absolute inset-0 rounded-full"
		style="
			background: radial-gradient(circle at 45% 45%, #ff7a18 0%, #ff9e3d 45%, rgba(255, 107, 26, 0) 75%);
			filter: blur(14px);
			opacity: {emberHeat * 0.28};
			transition: opacity {phase === 'dissolving' ? '1300ms' : phase === 'idle' ? '500ms' : '0ms'} ease-out;
		"
	></div>

	<!-- Tiny irregular warm core (#FF6B1A -> #FF9E3D -> transparent, blur 5px) -->
	<div
		class="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
		style="
			width: 10px;
			height: 8px;
			border-radius: 46% 54% 52% 48% / 54% 46% 54% 46%;
			background: radial-gradient(ellipse at 42% 40%, #fff3b0 0%, #ff9e3d 38%, #ff6b1a 70%, rgba(255, 107, 26, 0) 100%);
			filter: blur(5px);
			opacity: {emberHeat};
			transform: translate(-50%, -50%) scale({emberFlickerScale});
			transition: opacity {phase === 'dissolving' ? '1300ms' : phase === 'idle' ? '500ms' : '0ms'} ease-out;
		"
	></div>

	<!-- Pinpoint incandescent cherry seed (3px spark, blur 1px) -->
	<div
		class="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
		style="
			width: 3px;
			height: 3px;
			border-radius: 50%;
			background: #fff8e1;
			filter: blur(1px);
			opacity: {emberHeat * 0.9};
			transition: opacity {phase === 'dissolving' ? '1300ms' : phase === 'idle' ? '500ms' : '0ms'} ease-out;
		"
	></div>
</div>

<!-- Tip-Only Hotspot Target (Empty inner element, zero text selection, pointer-events: auto, z-30, cursor: none hides cursor completely) -->
<button
	type="button"
	class="lighter-hotspot absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border-0 p-0 outline-none select-none"
	style="
		left: {TIP_X}%;
		top: {TIP_Y}%;
		width: 26px;
		height: 26px;
		pointer-events: auto;
		cursor: none;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
		-webkit-user-select: none;
		{DEBUG_TIP
		? 'border: 1px dashed rgba(255, 60, 60, 0.9); background: rgba(255, 0, 0, 0.25);'
		: 'background: transparent;'}
	"
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onpointerdown={handlePointerDown}
	onclick={handleDebugClick}
	aria-label="Cigarette tip"
></button>

<style>
	/* Expand mobile tap target to 44px */
	@media (max-width: 768px) {
		.lighter-hotspot {
			width: 44px !important;
			height: 44px !important;
		}
	}
</style>

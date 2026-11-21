<script lang="ts">
	import { onMount } from 'svelte';

	// Top-level percentage coordinates for the cigarette tip hotspot (exact center on natural 764x1024 image)
	export const TIP_X = 16.36; // % from left of character artwork
	export const TIP_Y = 44.92; // % from top of character artwork
	export const DEBUG_TIP = false; // When true, displays 1px red dashed ring and logs clicked %

	// State machine: strictly starts in 'idle' on page load
	type Phase = 'idle' | 'lighting' | 'smoking' | 'dissolving';
	let phase: Phase = $state('idle');

	// Visual heat for natural ember glow
	let emberHeat = $state(0); // 0 to 1
	let emberFlickerScale = $state(1); // 0.94 to 1.06

	// Timing trackers
	let lightingStartTime = 0;
	let dissolvingStartTime = 0;
	let mobileBurstTimer: ReturnType<typeof setTimeout> | null = null;
	let cancelCooldownTimer: ReturnType<typeof setTimeout> | null = null;

	let animId: number | null = null;
	let isLoopRunning = false;
	let lastTimestamp = 0;

	// Canvas dimensions & tip anchor inside the canvas
	const CANVAS_WIDTH = 240;
	const CANVAS_HEIGHT = 360;
	const ANCHOR_X = 160; // 160px from left (allows 160px leftward drift)
	const ANCHOR_Y = 328; // 328px from top (allows >300px upward rise)

	let canvasRef: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D | null = null;

	// Pre-rendered offscreen sprite collections
	let hazeSprites: HTMLCanvasElement[] = [];
	let wispSprites: HTMLCanvasElement[] = [];
	let warmSprites: HTMLCanvasElement[] = [];

	function initSprites() {
		if (hazeSprites.length > 0 || typeof document === 'undefined') return;

		// 1. Soft outer haze sprites (96x96, muted warm-grey: rgba(190, 186, 178))
		for (let s = 0; s < 4; s++) {
			const off = document.createElement('canvas');
			off.width = 96;
			off.height = 96;
			const octx = off.getContext('2d');
			if (!octx) continue;

			const half = 48;
			const patchCount = s === 0 ? 6 : 9 + (s % 2);

			octx.save();
			octx.globalCompositeOperation = 'source-over';

			for (let p = 0; p < patchCount; p++) {
				const angle = (p / patchCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
				const dist = 4 + Math.random() * (s === 0 ? 10 : 18);
				const cx = half + Math.cos(angle) * dist;
				const cy = half + Math.sin(angle) * dist * (0.8 + Math.random() * 0.4);
				const radius = 12 + Math.random() * (s === 0 ? 14 : 22);

				const grad = octx.createRadialGradient(cx, cy, 0, cx, cy, radius);
				const alpha = 0.12 + Math.random() * 0.08;
				grad.addColorStop(0, `rgba(190, 186, 178, ${alpha})`);
				grad.addColorStop(0.45, `rgba(186, 182, 175, ${alpha * 0.6})`);
				grad.addColorStop(0.8, `rgba(180, 176, 170, ${alpha * 0.15})`);
				grad.addColorStop(1, 'rgba(175, 172, 168, 0)');

				octx.fillStyle = grad;
				octx.beginPath();
				octx.arc(cx, cy, radius, 0, Math.PI * 2);
				octx.fill();
			}

			// Destination-out cutouts for fibrous non-circular edges
			if (s > 0) {
				octx.globalCompositeOperation = 'destination-out';
				const cutouts = 2 + (s % 2);
				for (let c = 0; c < cutouts; c++) {
					const cAngle = Math.random() * Math.PI * 2;
					const cDist = 10 + Math.random() * 16;
					const ccx = half + Math.cos(cAngle) * cDist;
					const ccy = half + Math.sin(cAngle) * cDist;
					const cRadius = 9 + Math.random() * 12;

					const cGrad = octx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cRadius);
					cGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
					cGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.2)');
					cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

					octx.fillStyle = cGrad;
					octx.beginPath();
					octx.arc(ccx, ccy, cRadius, 0, Math.PI * 2);
					octx.fill();
				}
			}

			octx.restore();
			hazeSprites.push(off);
		}

		// 2. Thinner, sharper inner wisp trail sprites (64x64, rgba(215, 210, 202))
		for (let s = 0; s < 2; s++) {
			const off = document.createElement('canvas');
			off.width = 64;
			off.height = 64;
			const octx = off.getContext('2d');
			if (!octx) continue;

			const half = 32;
			octx.save();
			octx.globalCompositeOperation = 'source-over';

			// Elongated tight core filaments
			for (let p = 0; p < 5; p++) {
				const cx = half + (Math.random() - 0.5) * 8;
				const cy = half + (Math.random() - 0.5) * 12;
				const radius = 7 + Math.random() * 9;

				const grad = octx.createRadialGradient(cx, cy, 0, cx, cy, radius);
				const alpha = 0.22 + Math.random() * 0.1;
				grad.addColorStop(0, `rgba(215, 210, 202, ${alpha})`);
				grad.addColorStop(0.4, `rgba(205, 200, 192, ${alpha * 0.55})`);
				grad.addColorStop(0.85, `rgba(195, 190, 182, ${alpha * 0.12})`);
				grad.addColorStop(1, 'rgba(190, 185, 178, 0)');

				octx.fillStyle = grad;
				octx.beginPath();
				octx.arc(cx, cy, radius, 0, Math.PI * 2);
				octx.fill();
			}

			octx.restore();
			wispSprites.push(off);
		}

		// 3. Warm base tint sprites for the first 20px off cherry (64x64, rgba(255, 175, 105))
		for (let s = 0; s < 2; s++) {
			const off = document.createElement('canvas');
			off.width = 64;
			off.height = 64;
			const octx = off.getContext('2d');
			if (!octx) continue;

			const half = 32;
			octx.save();
			octx.globalCompositeOperation = 'source-over';

			for (let p = 0; p < 4; p++) {
				const cx = half + (Math.random() - 0.5) * 6;
				const cy = half + (Math.random() - 0.5) * 8;
				const radius = 6 + Math.random() * 8;

				const grad = octx.createRadialGradient(cx, cy, 0, cx, cy, radius);
				const alpha = 0.2 + Math.random() * 0.08;
				grad.addColorStop(0, `rgba(255, 175, 105, ${alpha})`);
				grad.addColorStop(0.45, `rgba(255, 140, 70, ${alpha * 0.5})`);
				grad.addColorStop(0.85, `rgba(255, 110, 40, ${alpha * 0.1})`);
				grad.addColorStop(1, 'rgba(255, 100, 30, 0)');

				octx.fillStyle = grad;
				octx.beginPath();
				octx.arc(cx, cy, radius, 0, Math.PI * 2);
				octx.fill();
			}

			octx.restore();
			warmSprites.push(off);
		}
	}

	interface SmokeParticle {
		type: 'haze' | 'wisp';
		x: number;
		y: number;
		vx: number;
		vy: number;
		age: number;
		maxLife: number;
		radius: number;
		startRadius: number;
		endRadius: number;
		angle: number;
		spin: number;
		spriteIdx: number;
		aspectRatio: number;
		peakAlpha: number;
	}

	interface Spark {
		x: number;
		y: number;
		vx: number;
		vy: number;
		age: number;
		maxLife: number; // 0.8s - 1.4s
		size: number; // 1.0px - 1.8px
		color: string; // '#FF9E3D' or '#FFD28A'
		twinkleSeed: number;
	}

	let particles: SmokeParticle[] = [];
	let sparks: Spark[] = [];
	let spawnAccumulator = 0;
	let sparkAccumulator = 0;
	let nextSparkInterval = 0.45; // 350ms - 700ms

	function spawnParticle(): SmokeParticle {
		// ~38% thin inner wisp trail, ~62% soft outer haze
		const isWisp = Math.random() < 0.38;

		// Spawn nearly vertically right at the tip anchor with minimal sub-pixel jitter
		const x = ANCHOR_X + (Math.random() - 0.5) * (isWisp ? 1.2 : 2.2);
		const y = ANCHOR_Y + (Math.random() - 0.5) * 1.4;

		const maxLife = isWisp ? 2.5 + Math.random() * 0.6 : 2.8 + Math.random() * 0.7;
		const startRadius = isWisp ? 2.2 + Math.random() * 0.9 : 3.4 + Math.random() * 1.8;
		const endRadius = isWisp ? 26 + Math.random() * 10 : 58 + Math.random() * 12;

		return {
			type: isWisp ? 'wisp' : 'haze',
			x,
			y,
			// Initial launch is nearly vertical (vx ≈ 0)
			vx: (Math.random() - 0.5) * 0.06,
			vy: -1.25 - Math.random() * 0.3,
			age: 0,
			maxLife,
			radius: startRadius,
			startRadius,
			endRadius,
			angle: Math.random() * Math.PI * 2,
			spin: (Math.random() - 0.5) * (isWisp ? 0.45 : 0.32),
			spriteIdx: Math.floor(Math.random() * (isWisp ? 2 : 4)),
			aspectRatio: isWisp ? 1.4 + Math.random() * 0.45 : 1.1 + Math.random() * 0.25,
			// Inner wisp trail has slightly higher contrast (0.038 - 0.052), outer haze is very subtle (0.020 - 0.028)
			peakAlpha: isWisp ? 0.038 + Math.random() * 0.014 : 0.021 + Math.random() * 0.007
		};
	}

	function spawnSpark(): Spark {
		const isLight = Math.random() < 0.45;
		return {
			x: ANCHOR_X + (Math.random() - 0.5) * 2.0,
			y: ANCHOR_Y - 1 - Math.random() * 2,
			vx: (Math.random() - 0.5) * 0.35,
			vy: -0.9 - Math.random() * 0.55,
			age: 0,
			maxLife: 0.8 + Math.random() * 0.6, // 0.8s - 1.4s
			size: 1.0 + Math.random() * 0.8, // 1.0px - 1.8px
			color: isLight ? '#FFD28A' : '#FF9E3D',
			twinkleSeed: Math.random() * 100
		};
	}

	function setupCanvas() {
		if (!canvasRef) return;
		const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
		canvasRef.width = Math.round(CANVAS_WIDTH * dpr);
		canvasRef.height = Math.round(CANVAS_HEIGHT * dpr);
		ctx = canvasRef.getContext('2d');
		if (ctx) {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
	}

	function startAnimationLoop() {
		if (isLoopRunning) return;
		isLoopRunning = true;
		lastTimestamp = performance.now();
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
			if (ctx) {
				ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			}
			particles = [];
			sparks = [];
			stopAnimationLoop();
			return;
		}

		const dt = Math.min(0.064, Math.max(0.001, (timestamp - lastTimestamp) / 1000));
		lastTimestamp = timestamp;

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

				// Lightly spawn an occasional micro-spark during final second
				sparkAccumulator += dt;
				if (sparkAccumulator >= nextSparkInterval) {
					sparks.push(spawnSpark());
					sparkAccumulator = 0;
					nextSparkInterval = 0.5 + Math.random() * 0.35;
				}
			} else {
				emberFlickerScale = 1;
			}

			emberHeat = heat;

			// Strictly ZERO smoke renders during the 3.5s lighting phase
			if (ctx) {
				ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			}
			particles = [];

			if (elapsed >= 3500) {
				// Exact 3.5s elapses: ignite cigarette and begin continuous fumes
				phase = 'smoking';
				emberHeat = 1;
			}
		}

		// State 2: Smoking continuous emission
		else if (phase === 'smoking') {
			emberHeat = 0.92 + Math.sin(timestamp * 0.025) * 0.08;
			emberFlickerScale = 1 + Math.sin(timestamp * 0.03) * 0.05;

			// Occasional micro-spark every 350ms - 700ms
			sparkAccumulator += dt;
			if (sparkAccumulator >= nextSparkInterval) {
				sparks.push(spawnSpark());
				sparkAccumulator = 0;
				nextSparkInterval = 0.35 + Math.random() * 0.35;
			}
		}

		// State 3: Exactly 1.3s gradual dissolve
		else if (phase === 'dissolving') {
			const elapsed = timestamp - dissolvingStartTime;
			const progress = Math.min(1, elapsed / 1300);
			const fade = 1 - progress;

			emberHeat = fade;
			emberFlickerScale = 1;

			if (elapsed >= 1300) {
				phase = 'idle';
				emberHeat = 0;
				if (ctx) {
					ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}
				particles = [];
				sparks = [];
				stopAnimationLoop();
				return;
			}
		}

		// Update and render canvas smoke particles & sparks
		if (ctx) {
			const prefersReducedMotion =
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (prefersReducedMotion) {
				ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				particles = [];
				sparks = [];
			} else {
				// 1. Particle Spawning (Smoking phase only)
				if (phase === 'smoking') {
					spawnAccumulator += dt * 44; // ~44 particles/sec
					while (spawnAccumulator >= 1 && particles.length < 135) {
						particles.push(spawnParticle());
						spawnAccumulator -= 1;
					}
				}

				// 2. Clear canvas
				ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				ctx.globalCompositeOperation = 'source-over';

				// 3. Dissolve factor for smooth fadeout
				let dissolveMultiplier = 1;
				if (phase === 'dissolving') {
					const dissolveElapsed = timestamp - dissolvingStartTime;
					dissolveMultiplier = Math.max(0, 1 - dissolveElapsed / 1300);
				}

				// 4. Update and draw each smoke particle
				for (let i = particles.length - 1; i >= 0; i--) {
					const p = particles[i];
					p.age += dt;
					const normAge = p.age / p.maxLife;

					if (normAge >= 1) {
						particles.splice(i, 1);
						continue;
					}

					// Rise distance from tip
					const riseY = ANCHOR_Y - p.y; // 0 at tip, ~260 at top

					// Natural laminar rise: slight right-then-left curve for the first 30-45px
					const laminarCurve = Math.sin(riseY * 0.08) * 0.14 - (riseY / 42) * 0.2;

					// Smooth turbulence ramp-up above 38px
					const turb = Math.min(1, Math.max(0, (riseY - 38) / 48));

					// Multi-octave curl wind field
					const f1 = Math.sin(p.y * 0.024 + timestamp * 0.002 + p.x * 0.014);
					const f2 = Math.cos(p.y * 0.048 - timestamp * 0.0016 + p.x * 0.022);
					const f3 = Math.sin(p.y * 0.09 + timestamp * 0.0034);

					// Gentle upward-left drift
					const curlX = -0.42 + (f1 * 0.72 + f2 * 0.42 + f3 * 0.22);
					const curlY = -1.36 + (f1 * 0.14 + f2 * 0.08) + normAge * 0.52;

					// Combine laminar path and curl turbulence
					const targetVx = laminarCurve * (1 - turb) + curlX * turb;
					const targetVy = -1.34 * (1 - turb) + curlY * turb;

					// Wisps hug the streamline tighter than diffuse haze
					const trackSpeed = p.type === 'wisp' ? 0.16 : 0.11;
					p.vx += (targetVx - p.vx) * trackSpeed;
					p.vy += (targetVy - p.vy) * trackSpeed;
					p.x += p.vx * (dt * 60);
					p.y += p.vy * (dt * 60);
					p.angle += p.spin * dt;

					// Radius expansion
					const expansion = Math.pow(normAge, p.type === 'wisp' ? 0.85 : 0.76);
					p.radius = p.startRadius + (p.endRadius - p.startRadius) * expansion;

					// Bell-curve alpha: rises quickly from 0, stays subtle, fades to 0
					let alpha: number;
					if (normAge < 0.15) {
						alpha = (normAge / 0.15) * p.peakAlpha;
					} else if (normAge < 0.48) {
						alpha = p.peakAlpha;
					} else {
						const fadeNorm = (normAge - 0.48) / 0.52;
						alpha = p.peakAlpha * Math.max(0, 1 - Math.pow(fadeNorm, 1.25));
					}

					alpha *= dissolveMultiplier;

					if (alpha > 0.001) {
						const dSize = p.radius * 2;
						const spriteList = p.type === 'wisp' ? wispSprites : hazeSprites;
						const sprite = spriteList[p.spriteIdx % spriteList.length];

						// Warm ember bounce: for the first 20px off cherry, blend tint warm
						const warmth = Math.max(0, 1 - riseY / 22);

						ctx.save();
						ctx.translate(p.x, p.y);
						ctx.rotate(p.angle);
						ctx.scale(1, p.aspectRatio);

						// Render warm ember reflection if near tip
						if (warmth > 0 && warmSprites.length > 0) {
							const warmSprite = warmSprites[p.spriteIdx % warmSprites.length];
							ctx.globalAlpha = alpha * warmth * 0.85;
							ctx.drawImage(warmSprite, -p.radius, -p.radius, dSize, dSize);
						}

						// Render primary smoke sprite
						if (sprite) {
							ctx.globalAlpha = alpha * (1 - warmth * 0.45);
							ctx.drawImage(sprite, -p.radius, -p.radius, dSize, dSize);
						}

						ctx.restore();
					}
				}

				// 5. Update and render occasional micro-sparks
				for (let i = sparks.length - 1; i >= 0; i--) {
					const s = sparks[i];
					s.age += dt;
					const sProgress = s.age / s.maxLife;

					if (sProgress >= 1) {
						sparks.splice(i, 1);
						continue;
					}

					// Drifts slowly upward with the smoke curl
					const curlWind = Math.sin(s.y * 0.03 + timestamp * 0.002) * 0.28 - 0.22;
					s.vx += (curlWind - s.vx) * 0.08;
					s.x += s.vx * (dt * 60);
					s.y += s.vy * (dt * 60);

					// Soft fade out over 0.8s - 1.4s with subtle organic twinkle
					const baseAlpha = Math.max(0, 1 - sProgress);
					const twinkle = 0.85 + Math.sin(timestamp * 0.02 + s.twinkleSeed) * 0.15;
					const sparkAlpha = Math.pow(baseAlpha, 1.4) * twinkle * dissolveMultiplier;

					if (sparkAlpha > 0.01) {
						ctx.save();
						ctx.globalAlpha = sparkAlpha * 0.9;
						ctx.fillStyle = s.color;
						ctx.shadowColor = s.color;
						ctx.shadowBlur = 3;
						ctx.beginPath();
						ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
						ctx.fill();
						ctx.restore();
					}
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
			startAnimationLoop();
		}
	}

	function handlePointerLeave(e: PointerEvent) {
		if (e.pointerType === 'mouse') {
			if (phase === 'lighting') {
				// Canceled before 3.5s: cool down ember over 500ms, emit zero fumes
				phase = 'idle';
				emberHeat = 0;
				emberFlickerScale = 1;
				if (ctx) {
					ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}
				particles = [];
				sparks = [];
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
		initSprites();
		setupCanvas();

		const handleResize = () => {
			setupCanvas();
		};
		window.addEventListener('resize', handleResize);

		return () => {
			stopAnimationLoop();
			window.removeEventListener('resize', handleResize);
			if (mobileBurstTimer) clearTimeout(mobileBurstTimer);
			if (cancelCooldownTimer) clearTimeout(cancelCooldownTimer);
		};
	});
</script>

<!-- Subtle Volumetric Smoke Canvas (Zero hard cuts, soft grey ink mist) -->
<canvas
	bind:this={canvasRef}
	class="smoke-canvas pointer-events-none select-none absolute z-[6]"
	style="
		left: calc({TIP_X}% - {ANCHOR_X}px);
		top: calc({TIP_Y}% - {ANCHOR_Y}px);
		width: {CANVAS_WIDTH}px;
		height: {CANVAS_HEIGHT}px;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
	"
	aria-hidden="true"
></canvas>

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
	.smoke-canvas {
		mask-image: linear-gradient(to top, black 0%, black 62%, transparent 98%),
			linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%);
		-webkit-mask-image: linear-gradient(to top, black 0%, black 62%, transparent 98%),
			linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%);
		mask-composite: intersect;
		-webkit-mask-composite: source-in;
	}

	/* Expand mobile tap target to 44px */
	@media (max-width: 768px) {
		.lighter-hotspot {
			width: 44px !important;
			height: 44px !important;
		}
	}
</style>

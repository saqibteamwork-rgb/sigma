'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type MascotMood = 'idle' | 'loading' | 'ready' | 'connected' | 'error';

interface SigmaMascotProps {
  mood?: MascotMood;
  onInteract?: () => void;
  className?: string;
}

const MASCOT_SRC =
  '/assets/aistudio/8df804ba-7a7b-4e86-a75d-7201ae23a265_bf50ad4c.png';

const MAX_UPPER_DROP = 33; // SVG user units in 736x736 coordinate space
const MAX_LOWER_RISE = 5.5;

export const SigmaMascot = React.memo(function SigmaMascot({
  mood = 'idle',
  onInteract,
  className = '',
}: SigmaMascotProps) {
  const leftUpperRef = useRef<SVGGElement>(null);
  const rightUpperRef = useRef<SVGGElement>(null);
  const leftLowerRef = useRef<SVGGElement>(null);
  const rightLowerRef = useRef<SVGGElement>(null);
  const shimmerRef = useRef<SVGGElement>(null);

  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const isBlinkingRef = useRef<boolean>(false);
  const reducedMotionRef = useRef<boolean>(false);

  const [isReacting, setIsReacting] = useState<boolean>(false);
  const reactTimerRef = useRef<number | null>(null);

  const applyBlinkProgress = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    const lidOpacity = clamped <= 0.01 ? 0 : Math.min(1, clamped * 6.5);
    const upperY = (clamped * MAX_UPPER_DROP).toFixed(2);
    const lowerY = (-clamped * MAX_LOWER_RISE).toFixed(2);
    const glintOpacity = (1 - clamped).toFixed(2);

    if (leftUpperRef.current) {
      leftUpperRef.current.setAttribute('transform', `translate(0 ${upperY})`);
      leftUpperRef.current.setAttribute('opacity', lidOpacity.toFixed(3));
    }
    if (rightUpperRef.current) {
      rightUpperRef.current.setAttribute('transform', `translate(0 ${upperY})`);
      rightUpperRef.current.setAttribute('opacity', lidOpacity.toFixed(3));
    }
    if (leftLowerRef.current) {
      leftLowerRef.current.setAttribute('transform', `translate(0 ${lowerY})`);
      leftLowerRef.current.setAttribute('opacity', lidOpacity.toFixed(3));
    }
    if (rightLowerRef.current) {
      rightLowerRef.current.setAttribute('transform', `translate(0 ${lowerY})`);
      rightLowerRef.current.setAttribute('opacity', lidOpacity.toFixed(3));
    }
    if (shimmerRef.current) {
      shimmerRef.current.setAttribute('opacity', glintOpacity);
    }
  }, []);

  const runBlinkSequence = useCallback(
    (doubleBlink = false) => {
      if (reducedMotionRef.current) return;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      isBlinkingRef.current = true;

      // Single natural human/anime blink timings (ms)
      const closeMs = 76;
      const holdMs = 44;
      const openMs = 132;
      const singleTotal = closeMs + holdMs + openMs;
      const gapMs = 108;
      const totalDuration = doubleBlink ? singleTotal * 2 + gapMs : singleTotal;

      const calcProgress = (t: number): number => {
        if (t <= 0 || t >= singleTotal) return 0;
        if (t < closeMs) {
          const u = t / closeMs;
          return u * u; // Crisp gravity-assisted lid drop
        }
        if (t < closeMs + holdMs) {
          return 1; // Brief natural full closure
        }
        const u = (t - closeMs - holdMs) / openMs;
        return Math.pow(1 - u, 3); // Smooth cushioned lift back to open
      };

      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        let progress = 0;

        if (elapsed < singleTotal) {
          progress = calcProgress(elapsed);
        } else if (doubleBlink && elapsed >= singleTotal + gapMs && elapsed < totalDuration) {
          progress = calcProgress(elapsed - singleTotal - gapMs);
        }

        applyBlinkProgress(progress);

        if (elapsed < totalDuration) {
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          applyBlinkProgress(0);
          isBlinkingRef.current = false;
          rafRef.current = null;
        }
      };

      rafRef.current = window.requestAnimationFrame(step);
    },
    [applyBlinkProgress]
  );

  // Natural irregular auto-blinking loop (pauses in hidden tabs or reduced-motion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    const handleMq = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
        applyBlinkProgress(0);
      }
    };
    mq.addEventListener?.('change', handleMq);

    const scheduleNext = (initial = false) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);

      // First blink arrives quickly (~1.1s) so user sees the live eyes blink immediately
      const baseDelay = initial
        ? 1100
        : mood === 'loading'
        ? 1900 + Math.random() * 1400
        : 2400 + Math.random() * 2400;

      timerRef.current = window.setTimeout(() => {
        if (!document.hidden && !reducedMotionRef.current && !isBlinkingRef.current) {
          const doDouble = !initial && Math.random() < 0.26;
          runBlinkSequence(doDouble);
        }
        scheduleNext(false);
      }, baseDelay);
    };

    scheduleNext(true);

    return () => {
      mq.removeEventListener?.('change', handleMq);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
    };
  }, [applyBlinkProgress, mood, runBlinkSequence]);

  // Expressive double-blink reaction when pairing code becomes ready or WhatsApp connects
  useEffect(() => {
    if (mood === 'ready' || mood === 'connected') {
      runBlinkSequence(true);
      setIsReacting(true);
      if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
      reactTimerRef.current = window.setTimeout(() => setIsReacting(false), 620);
    }
  }, [mood, runBlinkSequence]);

  const handleTap = () => {
    runBlinkSequence(true);
    setIsReacting(true);
    if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
    reactTimerRef.current = window.setTimeout(() => setIsReacting(false), 540);
    onInteract?.();
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label="SIGMA MD animated mascot — tap to blink"
      title="Tap SIGMA Mascot"
      className={`group relative shrink-0 w-[92px] h-[92px] sm:w-[118px] sm:h-[118px] rounded-[26px] sm:rounded-[30px] mascot-glass-halo flex items-end justify-center overflow-visible cursor-pointer select-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff] ${className}`}
    >
      {/* Soft ambient violet-cyan liquid reflection inside the glass frame */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-1 rounded-[22px] sm:rounded-[26px] transition-opacity duration-300 ${
          mood === 'connected'
            ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(14,200,156,0.28),transparent_72%)] opacity-100'
            : mood === 'ready'
            ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(34,107,255,0.25),transparent_72%)] opacity-100'
            : 'bg-[radial-gradient(circle_at_50%_45%,rgba(154,118,220,0.22),transparent_72%)] opacity-85 group-hover:opacity-100'
        }`}
      />

      {/* Character wrapper with strict 1:1 square box so SVG eyelids stay 100% pixel-locked */}
      <span
        className={`relative block shrink-0 aspect-square w-[104px] h-[104px] sm:w-[132px] sm:h-[132px] -mt-3 sm:-mt-3.5 mascot-breathe ${
          isReacting ? 'mascot-hop' : ''
        }`}
      >
        <img
          src={MASCOT_SRC}
          alt="SIGMA MD animated anime mascot"
          width={736}
          height={736}
          decoding="async"
          draggable={false}
          className="w-full h-full object-contain drop-shadow-[0_10px_16px_rgba(32,56,112,0.18)] pointer-events-none select-none"
        />

        {/* Pixel-locked SVG eyelid blink & subtle iris glint overlay (736x736 viewBox) */}
        <svg
          viewBox="0 0 736 736"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            {/* Exact face-skin gradient under bangs for natural eyelid blending */}
            <linearGradient id="sigma-lid-skin-l" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ead8cc" />
              <stop offset="48%" stopColor="#f7e7db" />
              <stop offset="100%" stopColor="#fdf0e6" />
            </linearGradient>
            <linearGradient id="sigma-lid-skin-r" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ecd9cd" />
              <stop offset="48%" stopColor="#f8e8dc" />
              <stop offset="100%" stopColor="#fcefe5" />
            </linearGradient>

            {/* Pixel-mapped clip regions strictly inside sclera + iris, preserving black hair bangs */}
            <clipPath id="sigma-left-eye-clip">
              <path d="M 238 390 Q 275 377 312 388 C 316 398 317 411 314 423 Q 278 426 242 422 C 236 413 236 401 238 390 Z" />
            </clipPath>
            <clipPath id="sigma-right-eye-clip">
              <path d="M 382 392 Q 422 378 460 392 C 462 403 460 414 454 423 Q 422 426 388 422 C 381 413 380 402 382 392 Z" />
            </clipPath>
          </defs>

          {/* Subtle lifelike purple eye specular glint when eyes are open */}
          <g ref={shimmerRef} opacity="1">
            <circle cx="271" cy="401" r="4.2" fill="#ffffff" fillOpacity="0.45" className="mascot-eye-glint" />
            <circle cx="418" cy="402" r="4.2" fill="#ffffff" fillOpacity="0.45" className="mascot-eye-glint" />
          </g>

          {/* LEFT EYE REALISTIC BLINK */}
          <g clipPath="url(#sigma-left-eye-clip)">
            <g ref={leftUpperRef} opacity="0" transform="translate(0 0)">
              {/* Descending eyelid skin covering static upper lash + iris */}
              <path
                d="M 232 332 L 322 332 L 322 391 Q 276 382 232 391 Z"
                fill="url(#sigma-lid-skin-l)"
              />
              {/* Soft eyelid crease line */}
              <path
                d="M 248 377 Q 276 371 304 378"
                fill="none"
                stroke="#d4b9a9"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeOpacity="0.7"
              />
              {/* Moving anime upper eyelash curve */}
              <path
                d="M 237 390 Q 276 383 313 391"
                fill="none"
                stroke="#252329"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
            </g>

            {/* Subtle lower-lid cushion rising slightly on closure */}
            <g ref={leftLowerRef} opacity="0" transform="translate(0 0)">
              <path
                d="M 234 423 Q 278 420 318 423 L 318 442 L 234 442 Z"
                fill="#fcebe0"
              />
            </g>
          </g>

          {/* RIGHT EYE REALISTIC BLINK */}
          <g clipPath="url(#sigma-right-eye-clip)">
            <g ref={rightUpperRef} opacity="0" transform="translate(0 0)">
              <path
                d="M 376 332 L 466 332 L 466 392 Q 422 383 376 392 Z"
                fill="url(#sigma-lid-skin-r)"
              />
              <path
                d="M 392 379 Q 422 372 450 380"
                fill="none"
                stroke="#d4b9a9"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeOpacity="0.7"
              />
              <path
                d="M 382 391 Q 422 384 460 392"
                fill="none"
                stroke="#252329"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
            </g>

            <g ref={rightLowerRef} opacity="0" transform="translate(0 0)">
              <path
                d="M 378 423 Q 422 420 462 423 L 462 442 L 378 442 Z"
                fill="#fce9e1"
              />
            </g>
          </g>
        </svg>
      </span>
    </button>
  );
});

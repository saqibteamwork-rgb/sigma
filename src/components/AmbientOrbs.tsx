'use client';

import { memo, useEffect, useRef } from 'react';

export const AmbientOrbs = memo(function AmbientOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarsePointer) return;

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX - window.innerWidth / 2;
      targetY = e.clientY - window.innerHeight / 2;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const nodes = containerRef.current?.querySelectorAll<HTMLElement>('[data-depth]');
          nodes?.forEach((node) => {
            const depth = parseFloat(node.dataset.depth || '0.02');
            node.style.transform = `translate3d(${(-targetX * depth).toFixed(1)}px, ${(-targetY * depth).toFixed(1)}px, 0)`;
          });
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Top-Left Sculpted Royal-Blue Glass Wave */}
      <div
        data-depth="0.022"
        className="absolute -top-24 -left-20 sm:-top-28 sm:-left-16 will-change-transform"
      >
        <div className="orb-float-1 glass-orb-tl w-64 h-64 sm:w-96 sm:h-96 rounded-[46%_54%_58%_42%/44%_48%_52%_56%] relative">
          <div className="absolute top-6 left-10 w-32 sm:w-36 h-14 sm:h-16 rounded-full bg-white/40 blur-md -rotate-24" />
        </div>
      </div>

      {/* Soft Ambient Cyan Caustic Glow */}
      <div
        data-depth="0.014"
        className="absolute top-1/2 right-[8%] -translate-y-1/2 will-change-transform"
      >
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-cyan-300/22 blur-3xl" />
      </div>

      {/* Bottom-Left Pale Periwinkle Liquid Glass Lobe */}
      <div
        data-depth="0.018"
        className="absolute -bottom-28 -left-24 will-change-transform"
      >
        <div className="orb-float-2 glass-orb-bl w-72 h-72 sm:w-[26rem] sm:h-[26rem] rounded-[54%_46%_42%_58%/52%_58%_42%_48%]" />
      </div>

      {/* Bottom-Right Large Translucent Aqua Bubble */}
      <div
        data-depth="0.026"
        className="absolute -bottom-24 -right-20 sm:-bottom-20 sm:-right-14 will-change-transform"
      >
        <div className="orb-float-2 glass-orb-br-lg w-72 h-72 sm:w-[27rem] sm:h-[27rem] rounded-full relative">
          <div className="absolute top-8 left-12 w-24 sm:w-28 h-10 sm:h-12 rounded-full bg-white/55 blur-sm -rotate-18" />
        </div>
      </div>

      {/* Bottom-Right Crisp Iridescent Glass Droplet Sphere */}
      <div
        data-depth="0.04"
        className="absolute bottom-20 right-4 sm:bottom-12 sm:right-12 will-change-transform"
      >
        <div className="orb-float-3 glass-orb-droplet w-16 h-16 sm:w-28 sm:h-28 rounded-full relative">
          <div className="absolute top-2.5 left-3.5 sm:top-3 sm:left-4 w-5 sm:w-6 h-3 sm:h-3.5 rounded-full bg-white/85 blur-[1px] -rotate-30" />
        </div>
      </div>
    </div>
  );
});

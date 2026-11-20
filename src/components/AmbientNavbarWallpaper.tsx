'use client';

import { memo } from 'react';

/**
 * AmbientNavbarWallpaper
 * Seamless living wallpaper effect behind the top navbar and upper hero area.
 * Completely feathered with radial mask & 4-way dissolved gradients:
 * Zero borders, zero sharp edges, feels like authentic ambient wallpaper.
 */
export const AmbientNavbarWallpaper = memo(function AmbientNavbarWallpaper() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 inset-x-0 h-[480px] sm:h-[580px] md:h-[660px] overflow-hidden pointer-events-none select-none z-0 flex items-start justify-center"
    >
      {/* Radiant Atmospheric Aura Glow */}
      <div className="absolute -top-12 inset-x-0 h-[440px] bg-gradient-to-b from-[#226bff]/28 via-[#0ec89c]/18 to-transparent blur-3xl transform-gpu pointer-events-none" />

      {/* Living Atmospheric Wallpaper Video with Seamless Zero-Border Feathering */}
      <div className="relative w-full max-w-7xl h-full flex items-start justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controls={false}
          preload="auto"
          className="w-full h-full object-cover object-top opacity-95 sm:opacity-100 transform-gpu pointer-events-none transition-opacity duration-700"
          style={{
            maskImage:
              'radial-gradient(ellipse 92% 82% at 50% 26%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.95) 58%, rgba(0, 0, 0, 0.45) 82%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 92% 82% at 50% 26%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.95) 58%, rgba(0, 0, 0, 0.45) 82%, transparent 100%)',
            filter: 'contrast(1.18) saturate(1.4) brightness(1.05)',
          }}
        >
          <source src="/assets/videos/ambient-liquid-glow.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gentle Top Feather — Guarantees Zero Visible Top Line */}
      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#eef5fc]/40 to-transparent pointer-events-none" />

      {/* Bottom Dissolve Gradient — Seamlessly melts into the page below hero cards */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#eef5fc] via-[#eef5fc]/60 to-transparent pointer-events-none" />

      {/* Left and Right Vignette Gradients — Gentle dissolve on ultra-wide screens */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#eef5fc]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#eef5fc]/70 to-transparent pointer-events-none" />
    </div>
  );
});

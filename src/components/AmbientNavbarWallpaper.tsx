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
      className="absolute top-0 inset-x-0 h-[340px] sm:h-[420px] md:h-[480px] overflow-hidden pointer-events-none select-none z-0 flex items-start justify-center"
    >
      {/* Radiant Atmospheric Aura Glow */}
      <div className="absolute -top-16 inset-x-0 h-[360px] bg-gradient-to-b from-[#226bff]/18 via-[#0ec89c]/10 to-transparent blur-3xl transform-gpu pointer-events-none" />

      {/* Living Atmospheric Wallpaper Video with Seamless Zero-Border Feathering */}
      <div className="relative w-full max-w-6xl h-full flex items-start justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controls={false}
          preload="auto"
          className="w-full h-full object-cover object-top opacity-75 sm:opacity-85 transform-gpu pointer-events-none transition-opacity duration-1000"
          style={{
            maskImage:
              'radial-gradient(ellipse 65% 55% at 50% 22%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.75) 45%, rgba(0, 0, 0, 0.25) 70%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 65% 55% at 50% 22%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.75) 45%, rgba(0, 0, 0, 0.25) 70%, transparent 100%)',
            filter: 'contrast(1.05) saturate(1.15)',
          }}
        >
          <source src="/assets/videos/ambient-liquid-glow.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Top Edge Feather Gradient — Guarantees Zero Visible Top Line */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#eef5fc] via-[#eef5fc]/60 to-transparent pointer-events-none" />

      {/* Bottom Dissolve Gradient — Seamlessly melts into the pairing hero section */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#eef5fc] via-[#eef5fc]/85 to-transparent pointer-events-none" />

      {/* Left and Right Vignette Gradients — Eliminates any side edge */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-[#eef5fc] via-[#eef5fc]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-36 bg-gradient-to-l from-[#eef5fc] via-[#eef5fc]/50 to-transparent pointer-events-none" />
    </div>
  );
});

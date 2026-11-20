'use client';

import { memo, useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  ExternalLink,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  ConsoleLogEntry,
  CreatorProfile,
  DEVELOPER_AVATAR_URL,
} from '../data/botHubData';

interface DeveloperHubPanelProps {
  profile: CreatorProfile;
  logs: ConsoleLogEntry[];
  onClearLogs: () => void;
}

export const DeveloperHubPanel = memo(function DeveloperHubPanel({
  profile,
  logs,
  onClearLogs,
}: DeveloperHubPanelProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const consoleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only the internal console log container without scrolling the main browser window
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <section
      id="developer-hub"
      className="cv-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch"
    >
      {/* Left: Official Developer & Contact Hub */}
      <article className="lg:col-span-6 liquid-card rounded-[28px] p-5 sm:p-6 flex flex-col justify-between gap-5">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b border-white/70">
            <div>
              <h2 className="text-[18px] sm:text-[19px] font-extrabold text-[#141d30] tracking-[-0.02em]">
                Official Developer &amp; Contact Hub
              </h2>
              <p className="text-[12px] font-medium text-[#526582]">
                Verified creator profile &amp; direct support channels
              </p>
            </div>
            <span className="text-[12px] font-semibold text-[#0b8c6e] whitespace-nowrap shrink-0">
              {profile.synced ? 'API Synced' : 'Verified'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#226bff] via-[#11c6e8] to-[#0ec89c] shadow-md shrink-0">
              {!avatarFailed ? (
                <img
                  src={DEVELOPER_AVATAR_URL}
                  alt={`${profile.name} — Creator of SIGMA MD`}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#226bff] to-[#0ec89c] text-white font-extrabold text-lg flex items-center justify-center border-2 border-white">
                  Σ
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] sm:text-[17px] font-extrabold text-[#141d30] truncate">
                  {profile.name}
                </h3>
                <BadgeCheck className="w-4 h-4 text-[#226bff] shrink-0" aria-label="Verified Creator" />
              </div>
              <p className="text-[13px] font-semibold text-[#475d7c] mt-0.5 leading-snug">
                {profile.tagline}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[12px] font-medium text-[#5c7190]">
                <MapPin className="w-3.5 h-3.5 text-[#e11d48] shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-[#526582] leading-relaxed mt-4">
            {profile.bio}
          </p>
        </div>

        {/* 3 Direct Contact Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href={profile.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-subpanel min-h-[60px] rounded-[16px] px-2.5 py-3 flex flex-col items-center justify-center gap-1 hover:bg-white/85 transition-all active:scale-[0.97] group"
          >
            <MessageCircle className="w-4 h-4 text-[#0ca884] group-hover:scale-110 transition-transform" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-[#141d30] whitespace-nowrap">WhatsApp</span>
          </a>

          <a
            href={profile.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-subpanel min-h-[60px] rounded-[16px] px-2.5 py-3 flex flex-col items-center justify-center gap-1 hover:bg-white/85 transition-all active:scale-[0.97] group"
          >
            <Globe className="w-4 h-4 text-[#226bff] group-hover:scale-110 transition-transform" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-[#141d30] whitespace-nowrap inline-flex items-center gap-1">
              <span>mrsaqib.me</span>
              <ExternalLink className="w-3 h-3 text-[#667d9c] hidden sm:inline" />
            </span>
          </a>

          <a
            href={profile.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-subpanel min-h-[60px] rounded-[16px] px-2.5 py-3 flex flex-col items-center justify-center gap-1 hover:bg-white/85 transition-all active:scale-[0.97] group"
          >
            <Instagram className="w-4 h-4 text-[#e11d48] group-hover:scale-110 transition-transform" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-[#141d30] whitespace-nowrap">Instagram</span>
          </a>
        </div>
      </article>

      {/* Right: Live Bot Activity Console */}
      <article className="lg:col-span-6 liquid-card rounded-[28px] p-5 sm:p-6 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#226bff]" />
            <h2 className="text-[17px] sm:text-[18px] font-extrabold text-[#141d30] tracking-[-0.02em]">
              Live Bot Activity Feed
            </h2>
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            className="glass-control min-h-[40px] px-3.5 py-1.5 rounded-[12px] text-[12px] font-bold text-[#445674] hover:text-[#141d30] hover:bg-white/85 active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        <div
          ref={consoleContainerRef}
          role="log"
          aria-live="polite"
          className="glass-console glass-scroll rounded-[18px] p-4 h-[196px] overflow-y-auto font-mono text-[12px] leading-relaxed space-y-1.5"
        >
          {logs.length === 0 ? (
            <div className="text-slate-400">
              Console cleared. Interact with the pairing workspace or cluster router to view events.
            </div>
          ) : (
            logs.map((entry) => (
              <div
                key={entry.id}
                className={
                  entry.level === 'success'
                    ? 'text-emerald-300'
                    : entry.level === 'error'
                    ? 'text-rose-300'
                    : 'text-sky-200'
                }
              >
                <span suppressHydrationWarning className="text-slate-400 tabular-nums mr-2">[{entry.time}]</span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
});

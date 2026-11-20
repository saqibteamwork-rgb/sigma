'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Search, Terminal, X } from 'lucide-react';
import {
  BOT_COMMANDS,
  BotCommand,
  COMMAND_FILTERS,
  CommandCategory,
} from '../data/botHubData';

interface CommandsShowcasePanelProps {
  onCopyCommand: (cmd: BotCommand) => void;
}

const ACCENT_CLASSES: Record<BotCommand['accent'], string> = {
  mint: 'text-[#0a8d70]',
  blue: 'text-[#1e60e6]',
  indigo: 'text-[#484de6]',
  amber: 'text-[#c2610c]',
  rose: 'text-[#be123c]',
};

export const CommandsShowcasePanel = memo(function CommandsShowcasePanel({ onCopyCommand }: CommandsShowcasePanelProps) {
  const [category, setCategory] = useState<CommandCategory>('all');
  const [query, setQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOT_COMMANDS.filter((cmd) => {
      const catMatch = category === 'all' || cmd.category === category;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.copyText.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const handleCopy = (cmd: BotCommand) => {
    onCopyCommand(cmd);
    setCopiedId(cmd.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === cmd.id ? null : prev));
    }, 1800);
  };

  return (
    <section id="commands-panel" className="cv-auto liquid-card rounded-[26px] sm:rounded-[34px] p-4 sm:p-7">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-[#141d30]">
            <Terminal className="w-5 h-5 text-[#226bff]" />
            <h2 className="text-[19px] sm:text-[23px] font-extrabold tracking-[-0.02em]">
              SIGMA MD Commands
            </h2>
          </div>
          <p className="text-[13px] font-medium text-[#526582] mt-0.5">
            Tap any command to copy for WhatsApp · 700+ commands available via <span className="font-mono font-bold text-[#141d30]">.menu</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input (16px on mobile to prevent Safari auto-zoom) */}
          <div className="relative min-w-[210px]">
            <label htmlFor="command-search" className="sr-only">
              Search bot commands
            </label>
            <Search className="w-4 h-4 text-[#617696] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="command-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="glass-input w-full min-h-[46px] sm:min-h-[42px] pl-10 pr-9 py-2 rounded-[14px] text-[16px] sm:text-[13.5px] font-semibold text-[#141d30] placeholder:text-[#7c90ad]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear command search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#617696] hover:text-[#141d30] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Interactive Category Filter Segmented Control */}
          <div
            role="tablist"
            aria-label="Filter bot commands by category"
            className="glass-control rounded-[16px] p-1 flex items-center gap-1 overflow-x-auto no-scrollbar"
          >
            {COMMAND_FILTERS.map((f) => {
              const active = category === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(f.key)}
                  className={`relative z-10 min-h-[40px] px-3.5 py-1.5 rounded-[12px] text-[12.5px] font-bold transition-colors active:scale-95 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff] ${
                    active ? 'text-white' : 'text-[#4c607e] hover:text-[#141d30]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="cmdFilterPill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="active-tab-pill absolute inset-0 rounded-[12px] -z-10"
                    />
                  )}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Commands Grid or Empty State */}
      {filteredCommands.length === 0 ? (
        <div className="glass-subpanel rounded-[20px] p-8 text-center space-y-3">
          <p className="text-[14px] font-semibold text-[#445674]">
            No commands match "{query}".
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="glass-control px-5 py-2.5 min-h-[44px] rounded-[14px] text-[13px] font-bold text-[#141d30] hover:bg-white/85 active:scale-95 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredCommands.map((cmd) => {
            const isCopied = copiedId === cmd.id;
            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => handleCopy(cmd)}
                className="glass-subpanel min-h-[66px] rounded-[18px] p-3.5 text-left hover:bg-white/85 active:scale-[0.97] transition-all cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[13px] font-bold truncate ${ACCENT_CLASSES[cmd.accent]}`}
                  >
                    {cmd.label}
                  </span>
                  <span className="shrink-0 text-[#7287a6] group-hover:text-[#226bff] transition-colors">
                    {isCopied ? (
                      <Check className="w-4 h-4 text-[#0ec89c]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <span className="text-[12px] font-medium text-[#526582] truncate">
                    {cmd.description}
                  </span>
                  {isCopied && (
                    <span className="text-[11px] font-bold text-[#0b8c6e] shrink-0">Copied</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
});

'use client';

import { memo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Globe,
  HelpCircle,
  Info,
  MessageCircle,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  ARCHITECTURE_PILLARS,
  BOT_CAPABILITIES_GUIDE,
  FAQ_ITEMS,
  SEO_PAGES,
  SeoRoutePath,
} from '../data/seoPagesData';
import { CreatorProfile } from '../data/botHubData';

interface SeoPagesViewProps {
  currentPath: SeoRoutePath;
  profile: CreatorProfile;
  onlineCount: number;
  totalNodes: number;
  onNavigate: (path: '/' | SeoRoutePath) => void;
}

const ROUTE_TABS: { path: SeoRoutePath; label: string; icon: typeof Info }[] = [
  { path: '/about', label: 'About SIGMA MD', icon: Info },
  { path: '/whatsapp-bot', label: 'WhatsApp Bot Guide', icon: Terminal },
  { path: '/faq', label: 'FAQ', icon: HelpCircle },
];

export const SeoPagesView = memo(function SeoPagesView({
  currentPath,
  profile,
  onlineCount,
  totalNodes,
  onNavigate,
}: SeoPagesViewProps) {
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);
  const pageMeta = SEO_PAGES[currentPath];

  return (
    <motion.div
      key={currentPath}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 sm:space-y-6"
    >
      {/* Top Return & Sub-Page Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="glass-control self-start min-h-[44px] px-4 py-2 rounded-[16px] inline-flex items-center gap-2 text-[13.5px] font-bold text-[#141d30] hover:bg-white/85 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#226bff]" />
          <span>Back to Bot Hub</span>
        </button>

        <nav
          aria-label="Information pages"
          className="glass-control rounded-[18px] p-1 flex items-center gap-1 overflow-x-auto no-scrollbar"
        >
          {ROUTE_TABS.map(({ path, label, icon: Icon }) => {
            const active = currentPath === path;
            return (
              <button
                key={path}
                type="button"
                onClick={() => onNavigate(path)}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 min-h-[40px] px-3.5 py-1.5 rounded-[12px] text-[12.5px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  active ? 'text-white' : 'text-[#4c607e] hover:text-[#141d30]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="seoSubPagePill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="active-tab-pill absolute inset-0 rounded-[12px] -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Article Header Card */}
      <article className="liquid-card rounded-[28px] sm:rounded-[34px] p-5 sm:p-8 space-y-6">
        <header className="space-y-2 border-b border-white/70 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#526582]">
            <span className="text-[#141d30] font-bold">SIGMA MD Documentation</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-[#0b8d70]">
              {onlineCount}/{totalNodes} Cloud Nodes Active
            </span>
            <span aria-hidden="true">·</span>
            <span>Multi-Device Ready</span>
          </div>

          <h1
            className="text-[26px] sm:text-[36px] font-extrabold tracking-[-0.03em] leading-[1.12] text-[#141d30]"
            style={{ textWrap: 'balance' }}
          >
            {pageMeta.heading}
          </h1>

          <p className="text-[14.5px] sm:text-[16px] text-[#4e617d] leading-relaxed max-w-[68ch]">
            {pageMeta.subtitle}
          </p>
        </header>

        {/* ROUTE 1: /about */}
        {currentPath === '/about' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {ARCHITECTURE_PILLARS.map((pillar, idx) => (
                <section
                  key={pillar.title}
                  className="glass-subpanel rounded-[20px] p-4 sm:p-5 space-y-2"
                >
                  <div className="font-mono tabular-nums text-[11.5px] font-bold text-[#226bff]">
                    0{idx + 1}
                  </div>
                  <h2 className="text-[16px] sm:text-[17px] font-extrabold text-[#141d30]">
                    {pillar.title}
                  </h2>
                  <p className="text-[13.5px] text-[#4e617d] leading-relaxed">{pillar.detail}</p>
                </section>
              ))}
            </div>

            <section className="glass-subpanel rounded-[22px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[15px] font-extrabold text-[#141d30]">
                  <ShieldCheck className="w-4 h-4 text-[#0ec89c]" />
                  <span>Built &amp; Maintained by {profile.name}</span>
                </div>
                <p className="text-[13px] text-[#526582] max-w-[56ch]">
                  {profile.tagline} · {profile.location}. Engineered with official WhatsApp Linked Devices compatibility and continuous anti-sleep cluster health monitoring.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-control min-h-[44px] px-4 py-2 rounded-[14px] inline-flex items-center gap-1.5 text-[13px] font-bold text-[#141d30] hover:bg-white/85 whitespace-nowrap"
                >
                  <Globe className="w-4 h-4 text-[#226bff]" />
                  <span>mrsaqib.me</span>
                </a>
                <a
                  href={profile.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-control min-h-[44px] px-4 py-2 rounded-[14px] inline-flex items-center gap-1.5 text-[13px] font-bold text-[#141d30] hover:bg-white/85 whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#0ca884]" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </section>
          </div>
        )}

        {/* ROUTE 2: /whatsapp-bot */}
        {currentPath === '/whatsapp-bot' && (
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#141d30]">
                How to Pair SIGMA MD in 4 Fast Steps
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    step: '01',
                    title: 'Enter WhatsApp Number',
                    text: 'Type your number with country code (or pick a quick prefix chip like PK +92, IN +91, AE +971).',
                  },
                  {
                    step: '02',
                    title: 'Generate 8-Digit Code',
                    text: 'Tap Get Code. The Smart Auto Load-Balancer routes your request to the fastest healthy node.',
                  },
                  {
                    step: '03',
                    title: 'Open Linked Devices',
                    text: 'On WhatsApp, open Settings > Linked Devices > Link a Device > Link with phone number instead.',
                  },
                  {
                    step: '04',
                    title: 'Paste Code & Run .menu',
                    text: 'Enter the 8-digit pairing code to link instantly, then send .menu to explore 700+ commands.',
                  },
                ].map((item) => (
                  <div key={item.step} className="glass-subpanel rounded-[18px] p-4 space-y-1.5">
                    <span className="font-mono tabular-nums text-[12px] font-bold text-[#226bff]">
                      Step {item.step}
                    </span>
                    <h3 className="text-[14.5px] font-extrabold text-[#141d30]">{item.title}</h3>
                    <p className="text-[12.5px] text-[#526582] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#141d30]">
                Core WhatsApp Multi-Device Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {BOT_CAPABILITIES_GUIDE.map((item) => (
                  <div key={item.category} className="glass-subpanel rounded-[20px] p-4 space-y-1.5">
                    <h3 className="text-[15px] font-extrabold text-[#141d30]">{item.category}</h3>
                    <div className="font-mono text-[12px] font-bold text-[#0b8d70]">
                      {item.commands}
                    </div>
                    <p className="text-[13px] text-[#4e617d] leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ROUTE 3: /faq */}
        {currentPath === '/faq' && (
          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id} className="glass-subpanel rounded-[18px] overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? '' : item.id)}
                    className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-white/50 transition-colors"
                  >
                    <h2 className="text-[14.5px] sm:text-[15.5px] font-extrabold text-[#141d30] leading-snug">
                      {item.question}
                    </h2>
                    <ChevronDown
                      className={`w-4 h-4 text-[#226bff] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-0.5 text-[13.5px] sm:text-[14px] text-[#4e617d] leading-relaxed border-t border-white/60">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Primary CTA Back to Live Pairing Workspace */}
        <div className="pt-4 border-t border-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-[#4e617d]">
            <Server className="w-4 h-4 text-[#226bff] shrink-0" />
            <span>Ready to connect your WhatsApp to SIGMA MD?</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="cta-liquid-btn min-h-[48px] px-6 py-2.5 rounded-[16px] text-white font-bold text-[14.5px] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Open Live Pair Tool</span>
          </button>
        </div>
      </article>
    </motion.div>
  );
});

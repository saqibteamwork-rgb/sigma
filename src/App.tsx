'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Cpu, KeyRound, MessageCircle, Server, Terminal } from 'lucide-react';
import {
  BotCommand,
  ClusterNode,
  ConsoleLogEntry,
  CreatorProfile,
  DEFAULT_CREATOR_PROFILE,
  INITIAL_CLUSTER_NODES,
  RoutingMode,
} from './data/botHubData';
import { HOME_SEO_META, SEO_PAGES, SeoRoutePath } from './data/seoPagesData';
import { AmbientOrbs } from './components/AmbientOrbs';
import { PairingHeroCard } from './components/PairingHeroCard';
import { ClusterRouterPanel } from './components/ClusterRouterPanel';
import { sweepClusterHealthDirect } from './lib/botClusterClient';

// Lazy-load below-the-fold, secondary mobile tabs, and dedicated SEO pages for zero initial overhead
const DeviceTelemetryStrip = lazy(() =>
  import('./components/DeviceTelemetryStrip').then((m) => ({ default: m.DeviceTelemetryStrip }))
);
const CommandsShowcasePanel = lazy(() =>
  import('./components/CommandsShowcasePanel').then((m) => ({ default: m.CommandsShowcasePanel }))
);
const DeveloperHubPanel = lazy(() =>
  import('./components/DeveloperHubPanel').then((m) => ({ default: m.DeveloperHubPanel }))
);
const SeoPagesView = lazy(() =>
  import('./components/SeoPagesView').then((m) => ({ default: m.SeoPagesView }))
);

type MobileSection = 'pair' | 'cluster' | 'commands' | 'system';
type AppRoute = '/' | SeoRoutePath;

function parseRoutePath(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/about' || clean === '/whatsapp-bot' || clean === '/faq') {
    return clean;
  }
  return '/';
}

function nowTimeStr() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function PanelSkeleton({ heightClass = 'h-48' }: { heightClass?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`liquid-card rounded-[28px] p-6 ${heightClass} animate-pulse flex flex-col justify-between`}
    >
      <div className="h-5 w-44 rounded-lg bg-white/70" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="h-14 rounded-2xl bg-white/60" />
        <div className="h-14 rounded-2xl bg-white/60" />
        <div className="h-14 rounded-2xl bg-white/60" />
        <div className="h-14 rounded-2xl bg-white/60" />
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>('/');
  const [nodes, setNodes] = useState<ClusterNode[]>(INITIAL_CLUSTER_NODES);
  const [onlineCount, setOnlineCount] = useState<number>(INITIAL_CLUSTER_NODES.length);
  const [totalPaired, setTotalPaired] = useState<number>(0);
  const [isCheckingCluster, setIsCheckingCluster] = useState<boolean>(false);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('auto');
  const [profile, setProfile] = useState<CreatorProfile>(DEFAULT_CREATOR_PROFILE);
  const [mobileTab, setMobileTab] = useState<MobileSection>('pair');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConsoleLogEntry[]>(() => [
    {
      id: 'init-1',
      time: nowTimeStr(),
      message: 'SIGMA MD Liquid Glass Bot Hub initialized.',
      level: 'success',
    },
    {
      id: 'init-2',
      time: nowTimeStr(),
      message: 'Enter your WhatsApp number above to request an 8-digit pairing code.',
      level: 'info',
    },
  ]);

  const toastTimerRef = useRef<number | null>(null);

  // Sync browser back/forward navigation safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoute(parseRoutePath(window.location.pathname));
    }
    const onPopState = () => {
      setRoute(parseRoutePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Dynamic per-route SEO title, description, canonical, and og:url sync
  useEffect(() => {
    const meta = route === '/' ? HOME_SEO_META : SEO_PAGES[route];
    document.title = meta.title;

    const descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descEl) descEl.content = meta.description;

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = meta.title;

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = meta.description;

    const canonicalUrl =
      route === '/' ? `${window.location.origin}/` : `${window.location.origin}${route}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;

    let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = canonicalUrl;
  }, [route]);

  const navigateTo = useCallback((nextPath: AppRoute) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setRoute(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addLog = useCallback((message: string, level: 'info' | 'success' | 'error' = 'info') => {
    setLogs((prev) => {
      const next: ConsoleLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: nowTimeStr(),
        message,
        level,
      };
      return [...prev.slice(-60), next];
    });
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const fetchClusterHealth = useCallback(
    async (manual = false) => {
      setIsCheckingCluster(true);
      if (manual) {
        addLog('Running direct client ping to all 11 cloud nodes (Zero Vercel Compute)...', 'info');
      }
      try {
        const data = await sweepClusterHealthDirect();
        if (Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          setOnlineCount(Number(data.onlineCount ?? 0));
          setTotalPaired(Number(data.totalPaired ?? 0));
          if (manual) {
            addLog(
              `Direct cluster sweep complete: ${data.onlineCount}/${data.totalNodes} online, ${data.totalPaired} paired active.`,
              data.onlineCount > 0 ? 'success' : 'error'
            );
            showToast(`${data.onlineCount}/${data.totalNodes} nodes online`);
          }
        }
      } catch (err) {
        if (manual) {
          const msg = err instanceof Error ? err.message : 'Health sweep failed';
          addLog(`Cluster ping error: ${msg}`, 'error');
        }
      } finally {
        setIsCheckingCluster(false);
      }
    },
    [addLog, showToast]
  );

  useEffect(() => {
    fetchClusterHealth(false);
    const interval = window.setInterval(() => fetchClusterHealth(false), 20000);

    fetch('https://mrsaqib242.vercel.app/api/public/contact')
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setProfile(json.data);
        }
      })
      .catch(() => {});

    return () => {
      window.clearInterval(interval);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [fetchClusterHealth]);

  const handleSelectRouting = useCallback(
    (mode: RoutingMode) => {
      setRoutingMode(mode);
      if (mode === 'auto') {
        addLog('Smart Auto Load-Balancer activated across all 11 SIGMA MD nodes.', 'info');
        showToast('Routing set to Smart Auto');
      } else {
        const node = nodes.find((n) => n.id === mode);
        if (node) {
          addLog(`Dedicated routing locked to ${node.name}.`, 'info');
          showToast(`Routing locked to ${node.short}`);
        }
      }
    },
    [nodes, addLog, showToast]
  );

  const handleCopyCommand = useCallback(
    (cmd: BotCommand) => {
      const finish = () => {
        addLog(`Copied command: ${cmd.copyText}`, 'success');
        showToast(`Copied "${cmd.copyText}"`);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(cmd.copyText).then(finish).catch(() => {
          fallbackCopy(cmd.copyText);
          finish();
        });
      } else {
        fallbackCopy(cmd.copyText);
        finish();
      }
    },
    [addLog, showToast]
  );

  const handleClearLogs = useCallback(() => setLogs([]), []);
  const handleManualRefresh = useCallback(() => fetchClusterHealth(true), [fetchClusterHealth]);

  const handleSwitchMobileTab = useCallback(
    (next: MobileSection) => {
      if (route !== '/') {
        navigateTo('/');
      }
      setMobileTab(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [route, navigateTo]
  );

  const scrollToSection = useCallback(
    (id: string) => {
      if (route !== '/') {
        navigateTo('/');
        window.setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [route, navigateTo]
  );

  const selectedNodeLabel =
    routingMode === 'auto'
      ? 'Smart Auto (11 Nodes)'
      : nodes.find((n) => n.id === routingMode)?.short || 'Smart Auto';

  const isSeoSubPage = route !== '/';

  return (
    <div className="min-h-dvh w-full relative flex flex-col selection:bg-blue-500/20 selection:text-blue-900">
      {/* Signature Liquid Glass Ambient Orbs */}
      <AmbientOrbs />

      {/* Desktop Top Navigation Bar (Strict 3-Zone Contract — Main UI stays clean) */}
      <header className="hidden lg:block relative z-20 w-full max-w-6xl mx-auto px-8 pt-6 pb-2">
        <div className="flex items-center justify-between gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="inline-flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.025em] text-[#141d30] whitespace-nowrap shrink-0"
          >
            <span
              aria-hidden="true"
              className="sigma-brand-mark w-8 h-8 rounded-[10px] inline-flex items-center justify-center text-white text-[16px] font-black leading-none"
            >
              Σ
            </span>
            <span>SIGMA MD</span>
          </a>

          <nav
            className="flex items-center gap-7 text-[14px] font-semibold text-[#4c607e]"
            aria-label="Primary navigation"
          >
            {[
              { id: 'pair-workspace', label: 'Pair Bot' },
              { id: 'cluster-panel', label: 'Cluster' },
              { id: 'device-telemetry', label: 'Device APIs' },
              { id: 'commands-panel', label: 'Commands' },
              { id: 'developer-hub', label: 'Developer' },
            ].map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.id);
                }}
                className="py-1.5 hover:text-[#141d30] transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={profile.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-control inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-full text-[13.5px] font-semibold text-[#18243d] hover:bg-white/85 transition-colors active:scale-95 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-[#0ec89c]" />
            <span>Direct Chat</span>
          </a>
        </div>
      </header>

      {/* Compact Non-Sticky Mobile Header */}
      <header className="lg:hidden relative z-20 w-full max-w-[560px] mx-auto px-4 pt-4 pb-1 flex items-center justify-between gap-3">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          <span
            aria-hidden="true"
            className="sigma-brand-mark w-8 h-8 rounded-[10px] inline-flex items-center justify-center text-white text-[15px] font-black leading-none"
          >
            Σ
          </span>
          <span className="text-[18px] font-extrabold tracking-[-0.025em] text-[#141d30]">
            SIGMA MD
          </span>
        </a>

        <a
          href={profile.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-control inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-full text-[12.5px] font-bold text-[#18243d] active:scale-95 whitespace-nowrap shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#0ec89c]" />
          <span>Chat</span>
        </a>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 pb-24 lg:py-6">
        {isSeoSubPage ? (
          /* Dedicated SEO Information Pages (/about, /whatsapp-bot, /faq) */
          <div className="w-full max-w-5xl mx-auto">
            <Suspense fallback={<PanelSkeleton heightClass="h-96" />}>
              <SeoPagesView
                currentPath={route}
                profile={profile}
                onlineCount={onlineCount}
                totalNodes={nodes.length}
                onNavigate={navigateTo}
              />
            </Suspense>
          </div>
        ) : (
          <>
            {/* Desktop Full-Presence Main Hub Layout (Zero Clutter) */}
            <div className="hidden lg:flex flex-col gap-6">
              <div className="grid grid-cols-12 gap-6 items-stretch">
                <div className="col-span-7">
                  <PairingHeroCard
                    routingMode={routingMode}
                    nodes={nodes}
                    onlineCount={onlineCount}
                    totalPaired={totalPaired}
                    onLog={addLog}
                    onToast={showToast}
                    onJumpToCluster={() => scrollToSection('cluster-panel')}
                  />
                </div>
                <div className="col-span-5">
                  <ClusterRouterPanel
                    nodes={nodes}
                    onlineCount={onlineCount}
                    totalPaired={totalPaired}
                    routingMode={routingMode}
                    isChecking={isCheckingCluster}
                    onSelectRouting={handleSelectRouting}
                    onRefreshHealth={handleManualRefresh}
                  />
                </div>
              </div>

              <Suspense fallback={<PanelSkeleton heightClass="h-64" />}>
                <DeviceTelemetryStrip
                  onlineCount={onlineCount}
                  totalNodes={nodes.length}
                  totalPaired={totalPaired}
                />
              </Suspense>

              <Suspense fallback={<PanelSkeleton heightClass="h-56" />}>
                <CommandsShowcasePanel onCopyCommand={handleCopyCommand} />
              </Suspense>

              <Suspense fallback={<PanelSkeleton heightClass="h-56" />}>
                <DeveloperHubPanel
                  profile={profile}
                  logs={logs}
                  onClearLogs={handleClearLogs}
                />
              </Suspense>

              {/* Quiet Editorial Footer with Real Crawlable Links to Dedicated SEO Pages */}
              <footer className="pt-2 pb-6 flex flex-wrap items-center justify-between gap-4 text-[12.5px] font-medium text-[#5a6f8e]">
                <span>
                  SIGMA MD · Engineered by <strong className="text-[#141d30]">{profile.name}</strong>
                </span>
                <nav aria-label="Site information links" className="flex flex-wrap items-center gap-3.5">
                  <a
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/about');
                    }}
                    className="hover:text-[#141d30] transition-colors"
                  >
                    About
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="/whatsapp-bot"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/whatsapp-bot');
                    }}
                    className="hover:text-[#141d30] transition-colors"
                  >
                    WhatsApp Bot Guide
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="/faq"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/faq');
                    }}
                    className="hover:text-[#141d30] transition-colors"
                  >
                    FAQ
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={profile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#141d30] transition-colors"
                  >
                    mrsaqib.me
                  </a>
                </nav>
              </footer>
            </div>

            {/* Mobile Smooth Animated Tabbed Liquid Glass Experience */}
            <div className="lg:hidden w-full max-w-[560px] mx-auto">
              <AnimatePresence mode="wait" initial={false}>
                {mobileTab === 'pair' && (
                  <motion.div
                    key="mobile-pair"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3.5"
                  >
                    <PairingHeroCard
                      routingMode={routingMode}
                      nodes={nodes}
                      onlineCount={onlineCount}
                      totalPaired={totalPaired}
                      onLog={addLog}
                      onToast={showToast}
                      onJumpToCluster={() => handleSwitchMobileTab('cluster')}
                    />

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSwitchMobileTab('cluster')}
                        className="liquid-card min-h-[68px] rounded-[20px] p-3.5 text-left flex items-center justify-between gap-2 active:scale-[0.97] transition-transform cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[#526582]">Active Route</div>
                          <div className="text-[13px] font-extrabold text-[#141d30] truncate mt-0.5">
                            {selectedNodeLabel}
                          </div>
                          <div className="text-[11px] font-semibold text-[#0b8d70] tabular-nums">
                            {onlineCount}/{nodes.length} online
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#617696] shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSwitchMobileTab('commands')}
                        className="liquid-card min-h-[68px] rounded-[20px] p-3.5 text-left flex items-center justify-between gap-2 active:scale-[0.97] transition-transform cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[#526582]">Bot Commands</div>
                          <div className="text-[13px] font-extrabold text-[#141d30] truncate mt-0.5">
                            700+ Ready
                          </div>
                          <div className="text-[11px] font-semibold text-[#226bff]">
                            Tap to browse
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#617696] shrink-0" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {mobileTab === 'cluster' && (
                  <motion.div
                    key="mobile-cluster"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ClusterRouterPanel
                      nodes={nodes}
                      onlineCount={onlineCount}
                      totalPaired={totalPaired}
                      routingMode={routingMode}
                      isChecking={isCheckingCluster}
                      onSelectRouting={handleSelectRouting}
                      onRefreshHealth={handleManualRefresh}
                    />
                  </motion.div>
                )}

                {mobileTab === 'commands' && (
                  <motion.div
                    key="mobile-commands"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Suspense fallback={<PanelSkeleton heightClass="h-72" />}>
                      <CommandsShowcasePanel onCopyCommand={handleCopyCommand} />
                    </Suspense>
                  </motion.div>
                )}

                {mobileTab === 'system' && (
                  <motion.div
                    key="mobile-system"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <Suspense fallback={<PanelSkeleton heightClass="h-64" />}>
                      <DeviceTelemetryStrip
                        onlineCount={onlineCount}
                        totalNodes={nodes.length}
                        totalPaired={totalPaired}
                      />
                      <DeveloperHubPanel
                        profile={profile}
                        logs={logs}
                        onClearLogs={handleClearLogs}
                      />
                    </Suspense>

                    {/* Quiet Mobile Info Footer Links to Dedicated SEO Pages */}
                    <footer className="pt-1 pb-2 flex items-center justify-center gap-3 text-[12px] font-semibold text-[#5a6f8e]">
                      <a
                        href="/about"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('/about');
                        }}
                        className="py-2 px-1 hover:text-[#141d30]"
                      >
                        About
                      </a>
                      <span aria-hidden="true">·</span>
                      <a
                        href="/whatsapp-bot"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('/whatsapp-bot');
                        }}
                        className="py-2 px-1 hover:text-[#141d30]"
                      >
                        Bot Guide
                      </a>
                      <span aria-hidden="true">·</span>
                      <a
                        href="/faq"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('/faq');
                        }}
                        className="py-2 px-1 hover:text-[#141d30]"
                      >
                        FAQ
                      </a>
                    </footer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>

      {/* Mobile Floating Liquid Glass Bottom Navigation */}
      <nav
        aria-label="Mobile hub navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-bottom-nav px-3 pt-1.5 pb-safe"
      >
        <div className="max-w-[520px] mx-auto grid grid-cols-4 gap-1">
          {(
            [
              { key: 'pair', label: 'Pair', icon: KeyRound },
              { key: 'cluster', label: 'Cluster', icon: Server },
              { key: 'commands', label: 'Commands', icon: Terminal },
              { key: 'system', label: 'System', icon: Cpu },
            ] as const
          ).map(({ key, label, icon: Icon }) => {
            const active = !isSeoSubPage && mobileTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSwitchMobileTab(key)}
                className={`relative min-h-[50px] rounded-[16px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors active:scale-95 cursor-pointer whitespace-nowrap ${
                  active ? 'text-[#226bff]' : 'text-[#5b6f8d]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobileBottomNavPill"
                    transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                    className="absolute inset-x-1.5 inset-y-0.5 rounded-[14px] bg-white/85 border border-white/95 shadow-sm -z-10"
                  />
                )}
                <Icon className="w-[19px] h-[19px]" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Liquid Glass Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            role="status"
            className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 glass-control px-4 py-2.5 rounded-full text-[13px] font-bold text-[#141d30] shadow-lg whitespace-nowrap pointer-events-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    // Ignore
  }
  document.body.removeChild(ta);
}

'use client';

import React, { memo, useRef } from 'react';
import { CheckCircle2, Cloud, RefreshCw, Server, Shuffle, XCircle } from 'lucide-react';
import { ClusterNode, RoutingMode } from '../data/botHubData';

interface ClusterRouterPanelProps {
  nodes: ClusterNode[];
  onlineCount: number;
  totalPaired: number;
  routingMode: RoutingMode;
  isChecking: boolean;
  onSelectRouting: (mode: RoutingMode) => void;
  onRefreshHealth: () => void;
}

export const ClusterRouterPanel = memo(function ClusterRouterPanel({
  nodes,
  onlineCount,
  totalPaired,
  routingMode,
  isChecking,
  onSelectRouting,
  onRefreshHealth,
}: ClusterRouterPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const activeNodeObj =
    routingMode === 'auto' ? null : nodes.find((n) => n.id === routingMode) || null;

  return (
    <section
      id="cluster-panel"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="liquid-card rounded-[28px] sm:rounded-[34px] p-5 sm:p-6 flex flex-col justify-between h-full overflow-hidden"
    >
      <div className="specular-sheen" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[19px] sm:text-[21px] font-extrabold tracking-[-0.02em] text-[#141d30]">
              11-Node Mega Cluster
            </h2>
            <p className="text-[12.5px] font-medium text-[#526582] mt-0.5 tabular-nums">
              {onlineCount}/{nodes.length} Online · {totalPaired} Active Paired ·{' '}
              {activeNodeObj ? `Dedicated ${activeNodeObj.short}` : 'Smart Auto Balanced'}
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshHealth}
            disabled={isChecking}
            aria-label="Refresh cluster node health"
            className="glass-control min-h-[40px] px-3.5 py-2 rounded-[14px] text-[12.5px] font-bold text-[#1c2b47] hover:bg-white/85 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#226bff] ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Pinging' : 'Ping All'}</span>
          </button>
        </div>

        {/* Smart Auto Load-Balancer Primary Selector */}
        <button
          type="button"
          onClick={() => onSelectRouting('auto')}
          aria-pressed={routingMode === 'auto'}
          className={`w-full min-h-[68px] rounded-[20px] p-3.5 sm:p-4 text-left transition-all active:scale-[0.985] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff] ${
            routingMode === 'auto'
              ? 'active-tab-pill text-white'
              : 'glass-subpanel text-[#141d30] hover:bg-white/75'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-[13.5px] font-extrabold">
              <Shuffle className="w-4 h-4 shrink-0" />
              <span>Smart Auto Load-Balancer</span>
            </span>
            <span className="font-mono tabular-nums text-[12px] font-bold opacity-95 whitespace-nowrap shrink-0">
              {totalPaired} Paired
            </span>
          </div>
          <p
            className={`text-[12px] mt-1 font-medium leading-snug ${
              routingMode === 'auto' ? 'text-white/85' : 'text-[#526582]'
            }`}
          >
            Dynamic least-loaded routing &amp; instant failover across 10 Heroku + 1 Railway nodes.
          </p>
        </button>

        {/* Individual 11 Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-2.5">
          {nodes.map((node) => {
            const isSelected = routingMode === node.id;
            const isRailway = node.type === 'Railway';

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelectRouting(node.id)}
                aria-pressed={isSelected}
                className={`min-h-[58px] rounded-[16px] p-3 sm:p-2.5 text-left transition-all active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff] ${
                  isRailway ? 'col-span-2 sm:col-span-2 lg:col-span-2 xl:col-span-2' : ''
                } ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#236dff]/15 to-[#0ec89c]/15 border-[1.5px] border-[#226bff] shadow-sm'
                    : 'glass-subpanel hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4a607e] truncate">
                    {isRailway ? (
                      <Server className="w-3 h-3 text-[#226bff] shrink-0" />
                    ) : (
                      <Cloud className="w-3 h-3 text-[#4d59f5] shrink-0" />
                    )}
                    <span className="truncate">{node.short}</span>
                  </span>

                  <span className="font-mono tabular-nums text-[10.5px] font-bold text-[#526582] shrink-0">
                    {node.online ? (node.ping !== null ? `${node.ping}ms` : 'Ready') : 'Offline'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 mt-1.5 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      node.online ? 'text-[#0a8f72]' : 'text-[#be123c]'
                    }`}
                  >
                    {node.online ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{node.online ? 'Online' : 'Offline'}</span>
                  </span>

                  <span className="font-mono tabular-nums text-[10.5px] font-semibold text-[#445674]">
                    {node.online ? `${node.active} paired` : '--'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});

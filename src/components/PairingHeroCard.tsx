'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  Phone,
  QrCode,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { ClusterNode, RoutingMode } from '../data/botHubData';
import { SigmaMascot } from './SigmaMascot';
import {
  pollPairStatusDirect,
  pollQrStatusDirect,
  requestPairCodeDirect,
  startQrSessionDirect,
} from '../lib/botClusterClient';

interface PairingHeroCardProps {
  routingMode: RoutingMode;
  nodes: ClusterNode[];
  onlineCount: number;
  totalPaired: number;
  onLog: (message: string, level?: 'info' | 'success' | 'error') => void;
  onToast: (message: string) => void;
  onJumpToCluster?: () => void;
}

type PairMode = 'code' | 'qr';
type ConnPhase = 'idle' | 'loading' | 'ready' | 'connected' | 'error';

const QUICK_COUNTRY_CODES = [
  { code: '92', label: 'PK +92' },
  { code: '91', label: 'IN +91' },
  { code: '971', label: 'AE +971' },
  { code: '966', label: 'SA +966' },
  { code: '44', label: 'UK +44' },
  { code: '1', label: 'US +1' },
];

export function PairingHeroCard({
  routingMode,
  nodes,
  onlineCount,
  totalPaired,
  onLog,
  onToast,
  onJumpToCluster,
}: PairingHeroCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<number | null>(null);
  const qrPollRef = useRef<number | null>(null);

  const [pairMode, setPairMode] = useState<PairMode>('code');
  const [phone, setPhone] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 8-Digit Code state
  const [phase, setPhase] = useState<ConnPhase>('idle');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [activeNodeLabel, setActiveNodeLabel] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  // QR state
  const [qrPhase, setQrPhase] = useState<ConnPhase>('idle');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrStatusMsg, setQrStatusMsg] = useState<string>('');
  const [qrNodeLabel, setQrNodeLabel] = useState<string | null>(null);

  const selectedNodeObj =
    routingMode === 'auto' ? null : nodes.find((n) => n.id === routingMode) || null;

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (qrPollRef.current) window.clearInterval(qrPollRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const normalizeInputNumber = (raw: string) => {
    let digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('03') && digits.length === 11) {
      digits = '92' + digits.slice(1);
    } else if (digits.startsWith('3') && digits.length === 10) {
      digits = '92' + digits;
    }
    return digits;
  };

  const handleApplyCountryPrefix = (cc: string) => {
    setValidationError(null);
    const cleaned = phone.replace(/[^0-9]/g, '');
    // Replace existing known prefix or prepend cleanly
    const existing = QUICK_COUNTRY_CODES.find((c) => cleaned.startsWith(c.code));
    const localPart = existing ? cleaned.slice(existing.code.length) : cleaned.replace(/^0+/, '');
    setPhone(`${cc}${localPart}`);
    inputRef.current?.focus();
  };

  const handleRequestPairCode = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setValidationError(null);

    const normalized = normalizeInputNumber(phone);
    if (!normalized || normalized.length < 10 || normalized.length > 15) {
      setValidationError('Enter a valid WhatsApp number with country code (e.g. 923001234567).');
      return;
    }

    setPhone(normalized);
    setPhase('loading');
    setPairingCode(null);
    setCodeCopied(false);
    setStatusMessage(`Dispatching SIGMA MD pairing request for +${normalized}...`);

    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const routeDesc = selectedNodeObj ? selectedNodeObj.name : 'Smart Auto (11-Node Cluster)';
    onLog(`SIGMA MD dispatching 8-digit pairing via ${routeDesc} for +${normalized}`, 'info');

    try {
      const data = await requestPairCodeDirect(normalized, routingMode);

      if (data.success && (data.isConnected || data.status === 'already_connected')) {
        const usedLabel = data.nodeShort || 'Cloud Node';
        setActiveNodeLabel(usedLabel);
        setPhase('connected');
        setStatusMessage(`Connected! SIGMA MD is online on ${usedLabel} for +${normalized}.`);
        onLog(`SIGMA MD already linked on ${usedLabel} for +${normalized}`, 'success');
        onToast(`SIGMA MD connected on ${usedLabel}`);
        return;
      }

      if (data.success && data.code) {
        const usedLabel = data.nodeShort || 'Cloud Node';
        const usedNodeId = data.nodeId || 's1';
        setPairingCode(String(data.code));
        setActiveNodeLabel(usedLabel);
        setPhase('ready');
        setStatusMessage(
          `Code ready on ${usedLabel}. Enter it in WhatsApp > Linked Devices > Link with phone number.`
        );
        onLog(`[${usedLabel}] SIGMA MD Pairing Code: ${data.code}`, 'success');
        onToast(`Code ready on ${usedLabel}`);

        let attempts = 0;
        pollRef.current = window.setInterval(async () => {
          attempts += 1;
          if (attempts > 40) {
            if (pollRef.current) window.clearInterval(pollRef.current);
            pollRef.current = null;
            return;
          }
          try {
            const stData = await pollPairStatusDirect(normalized, usedNodeId);
            if (stData.connected) {
              if (pollRef.current) window.clearInterval(pollRef.current);
              pollRef.current = null;
              setPhase('connected');
              setStatusMessage(`Connected! SIGMA MD is live on ${usedLabel} for +${normalized}.`);
              onLog(`SIGMA MD linked successfully via ${usedLabel} for +${normalized}`, 'success');
              onToast(`SIGMA MD connected on ${usedLabel}`);
            }
          } catch {
            // Keep polling quietly
          }
        }, 2500);
        return;
      }

      const tried = Array.isArray(data.attemptedNodes) ? ` (Tried: ${data.attemptedNodes.join(', ')})` : '';
      throw new Error(`${data.message || 'Cluster nodes could not generate code.'}${tried}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach bot cluster.';
      setPhase('error');
      setStatusMessage(msg);
      onLog(`Pairing failed: ${msg}`, 'error');
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    const finish = () => {
      setCodeCopied(true);
      onToast('8-digit pairing code copied');
      onLog(`Copied SIGMA MD pairing code ${pairingCode}`, 'success');
      window.setTimeout(() => setCodeCopied(false), 2200);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(pairingCode).then(finish).catch(() => {
        fallbackCopy(pairingCode);
        finish();
      });
    } else {
      fallbackCopy(pairingCode);
      finish();
    }
  };

  const handleGenerateQr = async () => {
    setQrPhase('loading');
    setQrStatusMsg('Requesting live SIGMA MD WhatsApp QR from cluster...');
    setQrImageUrl(null);

    if (qrPollRef.current) {
      window.clearInterval(qrPollRef.current);
      qrPollRef.current = null;
    }

    const routeDesc = selectedNodeObj ? selectedNodeObj.name : 'Smart Auto (11-Node Cluster)';
    onLog(`Requesting SIGMA MD QR session via ${routeDesc}...`, 'info');

    try {
      const data = await startQrSessionDirect(routingMode);

      if (data.success && data.qr) {
        const usedLabel = data.nodeShort || 'Cloud Node';
        const usedNodeId = data.nodeId || 's1';
        setQrImageUrl(data.qr);
        setQrNodeLabel(usedLabel);
        setQrPhase('ready');
        setQrStatusMsg(`QR ready on ${usedLabel}. Scan from WhatsApp > Linked Devices.`);
        onLog(`SIGMA MD QR code loaded from ${usedLabel}`, 'success');

        if (data.sessionId) {
          let polls = 0;
          qrPollRef.current = window.setInterval(async () => {
            polls += 1;
            if (polls > 30) {
              if (qrPollRef.current) window.clearInterval(qrPollRef.current);
              qrPollRef.current = null;
              return;
            }
            try {
              const stData = await pollQrStatusDirect(data.sessionId!, usedNodeId);
              if (stData.connected) {
                if (qrPollRef.current) window.clearInterval(qrPollRef.current);
                qrPollRef.current = null;
                setQrPhase('connected');
                setQrStatusMsg(`SIGMA MD connected via QR on ${usedLabel}!`);
                onLog(`SIGMA MD connected via QR code on ${usedLabel}`, 'success');
                onToast(`SIGMA MD connected on ${usedLabel}`);
              }
            } catch {
              // Ignore transient poll error
            }
          }, 2200);
        }
        return;
      }

      const tried = Array.isArray(data.attemptedNodes) ? ` (Tried: ${data.attemptedNodes.join(', ')})` : '';
      throw new Error(`${data.message || 'Could not retrieve QR code.'}${tried}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'QR request failed.';
      setQrPhase('error');
      setQrStatusMsg(msg);
      onLog(`QR error: ${msg}`, 'error');
    }
  };

  return (
    <section
      id="pair-workspace"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="liquid-hero-card rounded-[26px] sm:rounded-[34px] p-4 sm:p-7 flex flex-col justify-between h-full overflow-hidden"
    >
      <div className="specular-sheen" />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* Top Metadata Line & Route Selector Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] sm:text-[12.5px] font-medium text-[#526582]">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-bold text-[#141d30]">SIGMA MD Engine</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-[#0b8d70] font-semibold">
              {onlineCount}/{nodes.length} Online
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{totalPaired} Paired</span>
          </div>

          <button
            type="button"
            onClick={onJumpToCluster}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-2 -mr-2 text-[12px] font-bold text-[#226bff] hover:text-[#164ec4] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{selectedNodeObj ? `Node: ${selectedNodeObj.short}` : 'Smart Auto'}</span>
          </button>
        </div>

        {/* Hero Heading + Animated SIGMA Mascot */}
        <div className="flex items-center justify-between gap-3 sm:gap-5">
          <div className="space-y-1.5 min-w-0 flex-1">
            <h1
              className="text-[25px] sm:text-[36px] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#141d30]"
              style={{ textWrap: 'balance' }}
            >
              Connect SIGMA MD
            </h1>
            <p className="text-[13px] sm:text-[15px] text-[#4e617d] leading-relaxed max-w-[48ch]">
              Link your WhatsApp in seconds using an 8-digit pairing code or QR scan across our 11-node cloud cluster with automatic failover.
            </p>
          </div>

          <SigmaMascot
            mood={pairMode === 'code' ? phase : qrPhase}
            onInteract={() => onToast('SIGMA MD is online & ready to pair')}
          />
        </div>

        {/* Liquid Glass Segmented Tab Switcher */}
        <div
          role="tablist"
          aria-label="WhatsApp pairing method"
          className="glass-control rounded-[20px] p-1.5 grid grid-cols-2 gap-1.5 w-full sm:max-w-[420px]"
        >
          {([
            { key: 'code', label: '8-Digit Code', icon: KeyRound },
            { key: 'qr', label: 'QR Scan', icon: QrCode },
          ] as const).map(({ key, label, icon: Icon }) => {
            const active = pairMode === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPairMode(key)}
                className={`relative z-10 min-h-[46px] px-3 sm:px-4 py-2 rounded-[14px] text-[13.5px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff] ${
                  active ? 'text-white' : 'text-[#445674] hover:text-[#141d30]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="pairModeLiquidPill"
                    transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                    className="active-tab-pill absolute inset-0 rounded-[14px] -z-10"
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Mode Content */}
        <AnimatePresence mode="wait" initial={false}>
          {pairMode === 'code' ? (
            <motion.div
              key="code-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3.5"
            >
              {/* Quick Country Prefix Bar (Thumb-friendly horizontal scroll on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {QUICK_COUNTRY_CODES.map((c) => {
                  const isActive = phone.replace(/[^0-9]/g, '').startsWith(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleApplyCountryPrefix(c.code)}
                      className={`min-h-[36px] px-3 py-1 rounded-[12px] text-[12px] font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#226bff]/12 text-[#1853cc] border border-[#226bff]/40'
                          : 'glass-subpanel text-[#4a607e] hover:text-[#141d30]'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleRequestPairCode} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <label htmlFor="wa-phone-input" className="sr-only">
                    WhatsApp phone number with country code
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#226bff]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    id="wa-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="923001234567"
                    className="glass-input w-full min-h-[54px] pl-11 pr-4 py-3 rounded-[18px] text-[16px] font-bold text-[#141d30] placeholder:text-[#7c90ad] font-mono tabular-nums"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phase === 'loading'}
                  className="cta-liquid-btn w-full sm:w-auto min-h-[54px] px-7 py-3 rounded-[18px] text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-75 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226bff]"
                >
                  {phase === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{pairingCode ? 'New Code' : 'Get Code'}</span>
                    </>
                  )}
                </button>
              </form>

              {validationError && (
                <div
                  role="alert"
                  className="glass-subpanel rounded-[16px] px-4 py-3 flex items-center gap-2.5 text-[13px] font-semibold text-[#be123c]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 8-Digit Pairing Code Output Well */}
              {(phase === 'loading' || pairingCode) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    disabled={!pairingCode}
                    className="pairing-code-well w-full rounded-[22px] p-5 sm:p-6 text-center cursor-pointer active:scale-[0.99] disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0ec89c]"
                  >
                    <div className="text-[12px] font-semibold text-[#0b7e64] mb-1.5">
                      {activeNodeLabel
                        ? `SIGMA MD Pairing Code · ${activeNodeLabel}`
                        : 'Generating 8-Digit Pairing Code'}
                    </div>

                    <div className="font-mono tabular-nums text-[28px] sm:text-[42px] font-extrabold tracking-[0.18em] sm:tracking-[0.22em] text-[#141d30] leading-tight my-1.5 select-all break-all">
                      {pairingCode || 'WAITING...'}
                    </div>

                    {pairingCode && (
                      <div className="inline-flex items-center gap-1.5 mt-2 text-[12.5px] font-bold text-[#0d9274]">
                        {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{codeCopied ? 'Copied to clipboard' : 'Tap anywhere to copy code'}</span>
                      </div>
                    )}
                  </button>

                  {pairingCode && (
                    <div className="glass-subpanel rounded-[18px] px-4 py-3 text-[13px] text-[#445674] leading-relaxed">
                      <span className="font-bold text-[#141d30]">How to link: </span>
                      Open WhatsApp, tap <strong className="text-[#141d30]">Linked Devices</strong>, choose{' '}
                      <strong className="text-[#141d30]">Link with phone number instead</strong>, and enter the code above.
                    </div>
                  )}
                </motion.div>
              )}

              {/* Live Status Banner */}
              {phase !== 'idle' && statusMessage && (
                <div
                  role="status"
                  className={`rounded-[16px] px-4 py-3 border text-[13px] font-semibold flex items-center justify-between gap-3 ${
                    phase === 'connected'
                      ? 'bg-emerald-50/85 border-emerald-200 text-emerald-900'
                      : phase === 'error'
                      ? 'bg-rose-50/85 border-rose-200 text-rose-900'
                      : 'bg-sky-50/85 border-sky-200 text-[#183b6e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {phase === 'loading' && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#226bff]" />}
                    {phase === 'ready' && <Zap className="w-4 h-4 shrink-0 text-[#0ec89c]" />}
                    {phase === 'connected' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                    {phase === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span className="leading-snug">{statusMessage}</span>
                  </div>

                  {phase === 'error' && (
                    <button
                      type="button"
                      onClick={() => handleRequestPairCode()}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-white/90 text-rose-800 border border-rose-200 text-[12px] font-bold hover:bg-white active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="qr-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="glass-subpanel rounded-[22px] p-5 sm:p-6 flex flex-col items-center text-center gap-4"
            >
              <button
                type="button"
                onClick={handleGenerateQr}
                disabled={qrPhase === 'loading'}
                className="cta-liquid-btn w-full sm:w-auto min-h-[52px] px-7 py-3 rounded-[18px] text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-75"
              >
                {qrPhase === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading QR...</span>
                  </>
                ) : (
                  <>
                    {qrImageUrl ? <RefreshCw className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                    <span>{qrImageUrl ? 'Refresh QR Code' : 'Generate QR Code'}</span>
                  </>
                )}
              </button>

              {qrImageUrl && qrPhase !== 'connected' && (
                <div className="p-4 rounded-[22px] bg-white/95 border border-white shadow-lg flex flex-col items-center gap-2.5">
                  <img
                    src={qrImageUrl}
                    alt="SIGMA MD WhatsApp Multi-Device QR Code"
                    referrerPolicy="no-referrer"
                    className="w-52 h-52 sm:w-56 sm:h-56 rounded-xl object-contain"
                  />
                  <p className="text-[12.5px] font-semibold text-[#445674]">
                    Scan via WhatsApp &gt; Linked Devices {qrNodeLabel ? `· ${qrNodeLabel}` : ''}
                  </p>
                </div>
              )}

              {qrPhase === 'connected' && (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-[15px] py-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{qrStatusMsg}</span>
                </div>
              )}

              {qrPhase !== 'idle' && qrPhase !== 'connected' && qrStatusMsg && (
                <p
                  className={`text-[13px] font-semibold ${
                    qrPhase === 'error' ? 'text-rose-700' : 'text-[#4a607e]'
                  }`}
                >
                  {qrStatusMsg}
                </p>
              )}

              {qrPhase === 'idle' && (
                <p className="text-[13px] text-[#556a88] max-w-[40ch]">
                  Generate an instant SIGMA MD multi-device QR session routed through the fastest online node.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom 4-Step Compact Guide */}
      <div className="relative z-10 mt-5 sm:mt-6 pt-4 border-t border-white/70 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {[
          { step: '01', title: 'Enter Number' },
          { step: '02', title: 'Tap Get Code' },
          { step: '03', title: 'Open WhatsApp' },
          { step: '04', title: 'Link Device' },
        ].map((item) => (
          <div
            key={item.step}
            className="glass-subpanel rounded-[14px] px-3 py-2.5 flex items-center gap-2"
          >
            <span className="font-mono tabular-nums text-[11px] font-bold text-[#226bff]">
              {item.step}
            </span>
            <span className="text-[12px] sm:text-[12.5px] font-bold text-[#1a2842] truncate">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </section>
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
    // Ignore clipboard fallback errors
  }
  document.body.removeChild(ta);
}

'use client';

import { memo, useEffect, useState } from 'react';
import { fetchClientTelemetryDirect } from '../lib/botClusterClient';
import {
  Activity,
  BatteryCharging,
  Cpu,
  Globe,
  HardDrive,
  Laptop,
  MapPin,
  Monitor,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';

interface DeviceTelemetryStripProps {
  onlineCount: number;
  totalNodes: number;
  totalPaired: number;
}

interface BatterySnapshot {
  level: number;
  charging: boolean;
  supported: boolean;
}

interface ClientHardwareSpecs {
  osName: string;
  deviceType: string;
  browserName: string;
  isMobile: boolean;
  screenRes: string;
  cpuCores: string;
  memoryRam: string;
  networkType: string;
}

interface NavigatorWithExtras extends Navigator {
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
    addEventListener: (ev: string, cb: () => void) => void;
    removeEventListener: (ev: string, cb: () => void) => void;
  }>;
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
  };
  userAgentData?: {
    platform?: string;
  };
}

function detectClientSpecs(): ClientHardwareSpecs {
  if (typeof window === 'undefined') {
    return {
      osName: 'Cloud Client',
      deviceType: 'Desktop',
      browserName: 'Chrome',
      isMobile: false,
      screenRes: '1920 × 1080',
      cpuCores: '8 Cores',
      memoryRam: 'System Managed',
      networkType: 'Online · FAST',
    };
  }

  const nav = navigator as NavigatorWithExtras;
  const ua = nav.userAgent || '';
  const platform = (nav.userAgentData?.platform || nav.platform || '').toLowerCase();

  let osName = 'Desktop OS';
  let deviceType = 'Desktop';
  let isMobile = false;

  const isWin = platform.includes('win') || ua.includes('Windows');
  const isAndroid = ua.includes('Android');
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'macintel' && nav.maxTouchPoints > 1);
  const isMac = !isIOS && (platform.includes('mac') || ua.includes('Macintosh'));
  const isLinux = !isAndroid && (platform.includes('linux') || ua.includes('Linux'));

  if (isWin) {
    osName = ua.includes('Windows NT 10.0') ? 'Windows 11 / 10' : 'Windows';
    deviceType = 'Desktop PC';
  } else if (isAndroid) {
    osName = 'Android';
    deviceType = 'Mobile Device';
    isMobile = true;
  } else if (isIOS) {
    osName = ua.includes('iPad') ? 'iPadOS' : 'iOS';
    deviceType = ua.includes('iPhone') ? 'Apple iPhone' : 'Apple Device';
    isMobile = true;
  } else if (isMac) {
    osName = 'macOS';
    deviceType = 'Apple Mac';
  } else if (isLinux) {
    osName = 'Linux';
    deviceType = 'Workstation';
  }

  let browserName = 'Browser';
  if (ua.includes('Edg/')) browserName = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browserName = 'Opera';
  else if (ua.includes('SamsungBrowser/')) browserName = 'Samsung Internet';
  else if (ua.includes('Firefox/')) browserName = 'Firefox';
  else if (ua.includes('Chrome/')) browserName = 'Chrome';
  else if (ua.includes('Safari/')) browserName = 'Safari';

  const netEffective = nav.connection?.effectiveType
    ? nav.connection.effectiveType.toUpperCase()
    : 'WiFi / 4G';

  return {
    osName,
    deviceType,
    browserName,
    isMobile,
    screenRes: `${window.screen.width} × ${window.screen.height}`,
    cpuCores: `${nav.hardwareConcurrency || 4} Cores`,
    memoryRam: nav.deviceMemory ? `${nav.deviceMemory} GB RAM` : 'System Managed',
    networkType: nav.onLine ? `Online · ${netEffective}` : 'Offline',
  };
}

const INITIAL_SPECS: ClientHardwareSpecs = {
  osName: 'Desktop PC',
  deviceType: 'Desktop',
  browserName: 'Browser',
  isMobile: false,
  screenRes: '1920 × 1080',
  cpuCores: '8 Cores',
  memoryRam: 'System Managed',
  networkType: 'Online',
};

const GAUGE_CIRC = 2 * Math.PI * 22; // r=22 -> 138.23

export const DeviceTelemetryStrip = memo(function DeviceTelemetryStrip({
  onlineCount,
  totalNodes,
  totalPaired,
}: DeviceTelemetryStripProps) {
  const [battery, setBattery] = useState<BatterySnapshot>({
    level: 100,
    charging: true,
    supported: false,
  });
  const [publicIp, setPublicIp] = useState<string>('Resolving...');
  const [ipLocation, setIpLocation] = useState<string>('Detecting location');
  const [rttMs, setRttMs] = useState<number | null>(null);
  const [specs, setSpecs] = useState<ClientHardwareSpecs>(INITIAL_SPECS);

  // Battery API
  useEffect(() => {
    const nav = navigator as NavigatorWithExtras;
    if (!nav.getBattery) return;

    let active = true;
    let batRef: Awaited<ReturnType<NonNullable<NavigatorWithExtras['getBattery']>>> | null = null;
    const sync = () => {
      if (!active || !batRef) return;
      setBattery({
        level: Math.round(batRef.level * 100),
        charging: batRef.charging,
        supported: true,
      });
    };

    nav
      .getBattery()
      .then((b) => {
        if (!active) return;
        batRef = b;
        sync();
        b.addEventListener('levelchange', sync);
        b.addEventListener('chargingchange', sync);
      })
      .catch(() => {});

    return () => {
      active = false;
      if (batRef) {
        batRef.removeEventListener('levelchange', sync);
        batRef.removeEventListener('chargingchange', sync);
      }
    };
  }, []);

  // Real Client IP + Location (Zero Vercel Compute - Direct Client-Side)
  useEffect(() => {
    let active = true;
    fetchClientTelemetryDirect()
      .then((data) => {
        if (!active) return;
        if (data.ip) setPublicIp(String(data.ip));
        if (data.location) setIpLocation(String(data.location));
      })
      .catch(() => {
        if (!active) return;
        setPublicIp('Direct Client');
        setIpLocation('Connected');
      });
    return () => {
      active = false;
    };
  }, []);

  // Real Measured Direct Heroku Node RTT Ping
  useEffect(() => {
    let active = true;
    const measurePing = async () => {
      const t0 = performance.now();
      try {
        await fetch('https://saqib-bot-v1-d3ecc6f0292e.herokuapp.com/health', {
          cache: 'no-store',
          mode: 'cors',
        });
        if (!active) return;
        setRttMs(Math.max(1, Math.round(performance.now() - t0)));
      } catch {
        // Ignore transient network hiccup
      }
    };
    measurePing();
    const timer = window.setInterval(measurePing, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  // Update screen specs on mount and resize
  useEffect(() => {
    setSpecs(detectClientSpecs());
    const onResize = () => setSpecs(detectClientSpecs());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const batteryOffset = GAUGE_CIRC * (1 - Math.min(100, Math.max(0, battery.level)) / 100);
  const pingRatio = rttMs === null ? 0.25 : Math.min(1, Math.max(0.12, 1 - rttMs / 250));
  const pingOffset = GAUGE_CIRC * (1 - pingRatio);
  const uptimePct = totalNodes > 0 ? Math.round((onlineCount / totalNodes) * 100) : 0;
  const uptimeOffset = GAUGE_CIRC * (1 - uptimePct / 100);

  return (
    <section id="device-telemetry" className="cv-auto space-y-4">
      {/* 4-Column Liquid Glass Radial Telemetry KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Battery */}
        <article className="liquid-card rounded-[24px] p-4 sm:p-5 flex flex-col justify-between min-h-[138px]">
          <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-[#526582]">
            <span className="inline-flex items-center gap-1.5 text-[#182640]">
              <BatteryCharging className="w-4 h-4 text-[#0ec89c]" />
              <span>Battery</span>
            </span>
            <span>{battery.supported ? (battery.charging ? 'Charging' : 'On Battery') : 'AC Power'}</span>
          </div>

          <div className="flex items-end justify-between gap-2 mt-3">
            <div>
              <div className="font-mono tabular-nums text-[24px] sm:text-[26px] font-extrabold text-[#141d30] leading-none">
                {battery.level}%
              </div>
              <div className="text-[11.5px] font-medium text-[#526582] mt-1.5">
                {battery.charging ? 'Power connected' : 'Discharging'}
              </div>
            </div>

            <div className="gauge-well-glass relative w-14 h-14 rounded-full flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(14, 200, 156, 0.2)" strokeWidth="4.5" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#0ec89c"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={GAUGE_CIRC}
                  strokeDashoffset={batteryOffset}
                  className="progress-arc-smooth"
                />
              </svg>
              <div className="gauge-core-glass w-10 h-10 rounded-full flex items-center justify-center z-10">
                <Zap className="w-4 h-4 text-[#0ca884]" />
              </div>
            </div>
          </div>
        </article>

        {/* KPI 2: Public IP & Measured Latency */}
        <article className="liquid-card rounded-[24px] p-4 sm:p-5 flex flex-col justify-between min-h-[138px]">
          <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-[#526582]">
            <span className="inline-flex items-center gap-1.5 text-[#182640]">
              <Globe className="w-4 h-4 text-[#226bff]" />
              <span>Public IP</span>
            </span>
            <span>Edge RTT</span>
          </div>

          <div className="flex items-end justify-between gap-2 mt-3">
            <div className="min-w-0">
              <div className="font-mono tabular-nums text-[14px] sm:text-[15.5px] font-extrabold text-[#141d30] leading-tight truncate">
                {publicIp}
              </div>
              <div className="text-[11.5px] font-medium text-[#526582] mt-1.5 truncate">
                {ipLocation}
              </div>
            </div>

            <div className="gauge-well-glass relative w-14 h-14 rounded-full flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(34, 107, 255, 0.18)" strokeWidth="4.5" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#226bff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={GAUGE_CIRC}
                  strokeDashoffset={pingOffset}
                  className="progress-arc-smooth"
                />
              </svg>
              <div className="gauge-core-glass w-10 h-10 rounded-full flex items-center justify-center z-10">
                <span className="font-mono tabular-nums text-[10.5px] font-extrabold text-[#1f5ee0]">
                  {rttMs !== null ? `${rttMs}ms` : '--'}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* KPI 3: Device OS & Browser */}
        <article className="liquid-card rounded-[24px] p-4 sm:p-5 flex flex-col justify-between min-h-[138px]">
          <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-[#526582]">
            <span className="inline-flex items-center gap-1.5 text-[#182640]">
              {specs.isMobile ? (
                <Smartphone className="w-4 h-4 text-[#4b55f6]" />
              ) : (
                <Laptop className="w-4 h-4 text-[#4b55f6]" />
              )}
              <span>Device OS</span>
            </span>
            <span>Client</span>
          </div>

          <div className="flex items-end justify-between gap-2 mt-3">
            <div className="min-w-0">
              <div
                suppressHydrationWarning
                className="text-[17px] sm:text-[19px] font-extrabold text-[#141d30] leading-tight truncate"
              >
                {specs.osName}
              </div>
              <div
                suppressHydrationWarning
                className="text-[11.5px] font-medium text-[#526582] mt-1.5 truncate"
              >
                {specs.browserName} · {specs.deviceType}
              </div>
            </div>

            <div className="gauge-well-glass w-14 h-14 rounded-full flex items-center justify-center shrink-0">
              <div className="gauge-core-glass w-10 h-10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#4b55f6]" />
              </div>
            </div>
          </div>
        </article>

        {/* KPI 4: Cluster Availability */}
        <article className="liquid-card rounded-[24px] p-4 sm:p-5 flex flex-col justify-between min-h-[138px]">
          <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-[#526582]">
            <span className="inline-flex items-center gap-1.5 text-[#182640]">
              <Activity className="w-4 h-4 text-[#0ea5e9]" />
              <span>Cluster Uptime</span>
            </span>
            <span>Anti-Sleep</span>
          </div>

          <div className="flex items-end justify-between gap-2 mt-3">
            <div>
              <div className="font-mono tabular-nums text-[24px] sm:text-[26px] font-extrabold text-[#141d30] leading-none">
                {uptimePct}%
              </div>
              <div className="text-[11.5px] font-medium text-[#526582] mt-1.5 tabular-nums">
                {onlineCount}/{totalNodes} online · {totalPaired} paired
              </div>
            </div>

            <div className="gauge-well-glass relative w-14 h-14 rounded-full flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="4.5" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={GAUGE_CIRC}
                  strokeDashoffset={uptimeOffset}
                  className="progress-arc-smooth"
                />
              </svg>
              <div className="gauge-core-glass w-10 h-10 rounded-full flex items-center justify-center z-10">
                <span className="font-mono tabular-nums text-[10.5px] font-extrabold text-[#0284c7]">
                  {onlineCount}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Live Browser & Device APIs Strip */}
      <div className="liquid-card rounded-[26px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/70">
          <div>
            <h2 className="text-[15.5px] sm:text-[17px] font-extrabold text-[#141d30] tracking-[-0.015em]">
              Live Browser &amp; Device APIs
            </h2>
            <p className="text-[12px] font-medium text-[#526582]">
              Real-time hardware, display, and network specs read directly from your browser
            </p>
          </div>
          <span className="text-[12px] font-semibold text-[#0d9274]">
            Navigator API · Live
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Public IP', value: publicIp, icon: Globe, mono: true },
            { label: 'System OS', value: `${specs.osName} (${specs.deviceType})`, icon: Laptop, mono: false },
            { label: 'Browser Engine', value: specs.browserName, icon: Activity, mono: false },
            { label: 'Screen', value: specs.screenRes, icon: Monitor, mono: true },
            {
              label: 'Battery API',
              value: `${battery.level}% ${battery.charging ? 'Charging' : 'Battery'}`,
              icon: BatteryCharging,
              mono: true,
            },
            { label: 'CPU Cores', value: specs.cpuCores, icon: Cpu, mono: true },
            { label: 'Memory RAM', value: specs.memoryRam, icon: HardDrive, mono: true },
            { label: 'Location / Net', value: `${ipLocation} · ${specs.networkType}`, icon: MapPin, mono: false },
          ].map(({ label, value, icon: Icon, mono }) => (
            <div
              key={label}
              className="glass-subpanel rounded-[16px] px-3 py-2.5 flex items-center gap-2.5 min-w-0"
            >
              <div className="icon-badge-blue w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-[#226bff]">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-[#5a6f8e]">{label}</div>
                <div
                  suppressHydrationWarning
                  title={value}
                  className={`text-[12.5px] font-bold text-[#141d30] truncate ${
                    mono ? 'font-mono tabular-nums' : ''
                  }`}
                >
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

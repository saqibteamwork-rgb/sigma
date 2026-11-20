/**
 * SIGMA MD Direct Client-Side Cluster Connector
 * Zero Vercel Serverless / Fluid Compute usage:
 * All calls route directly from user's browser to the 10 Heroku Nodes + 1 Railway Node.
 */

export interface ClusterNodeConfig {
  id: string;
  name: string;
  short: string;
  url: string;
  type: 'Heroku' | 'Railway';
}

export interface ClusterNodeClientState extends ClusterNodeConfig {
  online: boolean;
  active: number;
  ping: number | null;
  checkedAt: number;
}

export interface ClusterHealthSnapshot {
  nodes: ClusterNodeClientState[];
  onlineCount: number;
  totalNodes: number;
  totalPaired: number;
  checkedAt: number;
}

export const CLUSTER_CONFIG: ClusterNodeConfig[] = [
  { id: 's1', name: 'Node 1 (Heroku-1)', short: 'Heroku-1', url: 'https://saqib-bot-v1-d3ecc6f0292e.herokuapp.com', type: 'Heroku' },
  { id: 's2', name: 'Node 2 (Heroku-2)', short: 'Heroku-2', url: 'https://saqib-bot-s2-1cceb03e9698.herokuapp.com', type: 'Heroku' },
  { id: 's3', name: 'Node 3 (Heroku-3)', short: 'Heroku-3', url: 'https://saqibbot3-bb2b46aa1cb4.herokuapp.com', type: 'Heroku' },
  { id: 's4', name: 'Node 4 (Heroku-4)', short: 'Heroku-4', url: 'https://saqibot4-1469f73b3d77.herokuapp.com', type: 'Heroku' },
  { id: 's5', name: 'Node 5 (Heroku-5)', short: 'Heroku-5', url: 'https://saqibbot5-5ffa090fe31f.herokuapp.com', type: 'Heroku' },
  { id: 's6', name: 'Node 6 (Heroku-6)', short: 'Heroku-6', url: 'https://saqibot6-061b6d17645d.herokuapp.com', type: 'Heroku' },
  { id: 's7', name: 'Node 7 (Heroku-7)', short: 'Heroku-7', url: 'https://saqibot7-b9d00e67a587.herokuapp.com', type: 'Heroku' },
  { id: 's8', name: 'Node 8 (Heroku-8)', short: 'Heroku-8', url: 'https://saqibbot8-f10fafc8b934.herokuapp.com', type: 'Heroku' },
  { id: 's9', name: 'Node 9 (Heroku-9)', short: 'Heroku-9', url: 'https://saqibbot9-bebb531508e3.herokuapp.com', type: 'Heroku' },
  { id: 's10', name: 'Node 10 (Heroku-10)', short: 'Heroku-10', url: 'https://saqibot10-d27e9f3ad01e.herokuapp.com', type: 'Heroku' },
  { id: 'railway', name: 'Node 11 (Railway)', short: 'Railway-11', url: 'https://web-production-08da5300.up.railway.app', type: 'Railway' },
];

let roundRobinIndex = 0;

export function normalizePhoneNumber(raw: string): string {
  let num = String(raw || '').replace(/[^0-9]/g, '');
  if (num.startsWith('03') && num.length === 11) {
    num = '92' + num.slice(1);
  } else if (num.startsWith('3') && num.length === 10) {
    num = '92' + num;
  }
  return num;
}

export function getNodeById(id: string): ClusterNodeConfig | undefined {
  return CLUSTER_CONFIG.find((n) => n.id === id);
}

export function getOrderedNodes(requestedNodeId?: string): ClusterNodeConfig[] {
  const all = [...CLUSTER_CONFIG];
  if (requestedNodeId && requestedNodeId !== 'auto') {
    const selected = all.find((n) => n.id === requestedNodeId);
    if (selected) {
      return [selected, ...all.filter((n) => n.id !== requestedNodeId)];
    }
  }

  roundRobinIndex = (roundRobinIndex + 1) % all.length;
  return [...all.slice(roundRobinIndex), ...all.slice(0, roundRobinIndex)];
}

async function fetchDirectJson(url: string, timeoutMs = 12000): Promise<{ ok: boolean; status: number; json: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Direct WhatsApp 8-Digit Pairing Code Request (Browser -> Heroku direct)
 */
export async function requestPairCodeDirect(
  rawNumber: string,
  routingMode: string
): Promise<{
  success: boolean;
  code?: string;
  isConnected?: boolean;
  status?: string;
  number: string;
  nodeId: string;
  nodeName: string;
  nodeShort: string;
  message?: string;
  attemptedNodes: string[];
}> {
  const number = normalizePhoneNumber(rawNumber);
  if (!number || number.length < 10 || number.length > 15) {
    return {
      success: false,
      number,
      nodeId: 's1',
      nodeName: 'Heroku-1',
      nodeShort: 'Heroku-1',
      message: 'Enter a valid WhatsApp number with country code (e.g. 923001234567).',
      attemptedNodes: [],
    };
  }

  const candidates = getOrderedNodes(routingMode).slice(0, 3);
  const attemptedNodes: string[] = [];
  let lastError = 'No cluster node responded in time.';

  for (const node of candidates) {
    attemptedNodes.push(node.short);
    try {
      const res = await fetchDirectJson(
        `${node.url}/api/pair?number=${encodeURIComponent(number)}`,
        12000
      );
      if (res.json) {
        const data = res.json;
        if (data.success && data.code) {
          return {
            success: true,
            code: String(data.code),
            number,
            nodeId: node.id,
            nodeName: node.name,
            nodeShort: node.short,
            attemptedNodes,
          };
        }
        if (data.isConnected || data.status === 'already_connected') {
          return {
            success: true,
            isConnected: true,
            status: 'already_connected',
            number,
            nodeId: node.id,
            nodeName: node.name,
            nodeShort: node.short,
            attemptedNodes,
          };
        }
        lastError = String(data.message || data.error || `Node ${node.short} returned an error.`);
      } else {
        lastError = `Node ${node.short} returned status ${res.status}.`;
      }
    } catch (err) {
      lastError = err instanceof Error && err.name === 'AbortError'
        ? `${node.short} timed out.`
        : `${node.short} unreachable.`;
    }
  }

  return {
    success: false,
    message: lastError,
    number,
    nodeId: candidates[0]?.id || 's1',
    nodeName: candidates[0]?.name || 'Heroku',
    nodeShort: candidates[0]?.short || 'Heroku',
    attemptedNodes,
  };
}

/**
 * Direct Pairing Status Poll (Browser -> Heroku direct)
 */
export async function pollPairStatusDirect(
  number: string,
  nodeId: string
): Promise<{ connected: boolean; nodeId: string; nodeShort: string }> {
  const node = getNodeById(nodeId) || CLUSTER_CONFIG[0];
  const normalized = normalizePhoneNumber(number);

  try {
    const res = await fetchDirectJson(
      `${node.url}/api/pair/status?number=${encodeURIComponent(normalized)}`,
      5000
    );
    return {
      connected: Boolean(res.json?.connected),
      nodeId: node.id,
      nodeShort: node.short,
    };
  } catch {
    return { connected: false, nodeId: node.id, nodeShort: node.short };
  }
}

/**
 * Direct QR Code Generation (Browser -> Heroku direct)
 */
export async function startQrSessionDirect(
  routingMode: string
): Promise<{
  success: boolean;
  qr?: string;
  sessionId?: string;
  nodeId: string;
  nodeName: string;
  nodeShort: string;
  message?: string;
  attemptedNodes: string[];
}> {
  const candidates = getOrderedNodes(routingMode).slice(0, 3);
  const attemptedNodes: string[] = [];
  let lastError = 'Unable to load QR code from cluster nodes.';

  for (const node of candidates) {
    attemptedNodes.push(node.short);
    try {
      const res = await fetchDirectJson(`${node.url}/api/qr/start`, 12000);
      if (res.json && res.json.success && res.json.qr) {
        return {
          success: true,
          qr: String(res.json.qr),
          sessionId: String(res.json.sessionId || ''),
          nodeId: node.id,
          nodeName: node.name,
          nodeShort: node.short,
          attemptedNodes,
        };
      }
      lastError = String(res.json?.message || res.json?.error || `${node.short} QR unavailable.`);
    } catch (err) {
      lastError = err instanceof Error && err.name === 'AbortError'
        ? `${node.short} timed out.`
        : `${node.short} unreachable.`;
    }
  }

  return {
    success: false,
    message: lastError,
    nodeId: candidates[0]?.id || 's1',
    nodeName: candidates[0]?.name || 'Heroku',
    nodeShort: candidates[0]?.short || 'Heroku',
    attemptedNodes,
  };
}

/**
 * Direct QR Status Poll (Browser -> Heroku direct)
 */
export async function pollQrStatusDirect(
  sessionId: string,
  nodeId: string
): Promise<{ connected: boolean; nodeId: string; nodeShort: string }> {
  const node = getNodeById(nodeId) || CLUSTER_CONFIG[0];

  try {
    const res = await fetchDirectJson(
      `${node.url}/api/qr/status?id=${encodeURIComponent(sessionId)}`,
      5000
    );
    return {
      connected: Boolean(res.json?.connected),
      nodeId: node.id,
      nodeShort: node.short,
    };
  } catch {
    return { connected: false, nodeId: node.id, nodeShort: node.short };
  }
}

/**
 * Direct Cluster Health Sweep (Browser pings all Heroku / Railway nodes directly)
 */
export async function sweepClusterHealthDirect(): Promise<ClusterHealthSnapshot> {
  const results = await Promise.allSettled(
    CLUSTER_CONFIG.map(async (cfg) => {
      const t0 = performance.now();
      try {
        const res = await fetchDirectJson(`${cfg.url}/health`, 3500);
        const latency = Math.max(1, Math.round(performance.now() - t0));
        if (res.ok && res.json) {
          const activeSessions =
            typeof res.json.activeSessions === 'number'
              ? res.json.activeSessions
              : typeof res.json.pairedSessions === 'number'
              ? res.json.pairedSessions
              : typeof res.json.activeConnections === 'number'
              ? res.json.activeConnections
              : 0;

          return {
            ...cfg,
            online: true,
            active: Math.max(0, activeSessions),
            ping: latency,
            checkedAt: Date.now(),
          } as ClusterNodeClientState;
        }
        return {
          ...cfg,
          online: false,
          active: 0,
          ping: latency,
          checkedAt: Date.now(),
        } as ClusterNodeClientState;
      } catch {
        return {
          ...cfg,
          online: false,
          active: 0,
          ping: null,
          checkedAt: Date.now(),
        } as ClusterNodeClientState;
      }
    })
  );

  const nodes: ClusterNodeClientState[] = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          ...CLUSTER_CONFIG[i],
          online: false,
          active: 0,
          ping: null,
          checkedAt: Date.now(),
        }
  );

  return {
    nodes,
    onlineCount: nodes.filter((n) => n.online).length,
    totalNodes: nodes.length,
    totalPaired: nodes.reduce((sum, n) => sum + (n.online ? n.active : 0), 0),
    checkedAt: Date.now(),
  };
}

/**
 * Direct Client IP & Location via free public Geo API (No Vercel serverless function needed)
 */
export async function fetchClientTelemetryDirect(): Promise<{ ip: string; location: string; isp?: string }> {
  try {
    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const city = data.city || '';
        const cc = data.country_code || data.country || '';
        const isp = data.connection?.isp || '';
        return {
          ip: String(data.ip),
          location: [city, cc].filter(Boolean).join(', ') || 'Online',
          isp: isp || undefined,
        };
      }
    }
  } catch {
    // Fallback
  }

  try {
    const res2 = await fetch('https://api.ipify.org?format=json');
    if (res2.ok) {
      const d = await res2.json();
      if (d?.ip) {
        return { ip: String(d.ip), location: 'Direct Connected' };
      }
    }
  } catch {
    // Fallback
  }

  return { ip: 'Client Node', location: 'Active' };
}

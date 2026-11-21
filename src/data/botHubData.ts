export type NodeProvider = 'Heroku' | 'Railway';

export interface ClusterNode {
  id: string;
  name: string;
  short: string;
  type: NodeProvider;
  online: boolean;
  active: number;
  ping: number | null;
  checkedAt?: number;
}

export interface ClusterHealthSnapshot {
  nodes: ClusterNode[];
  onlineCount: number;
  totalNodes: number;
  totalPaired: number;
  checkedAt: number;
}

export type RoutingMode = 'auto' | string;

export type CommandCategory = 'all' | 'music' | 'ai' | 'group' | 'fun';

export interface BotCommand {
  id: string;
  label: string;
  copyText: string;
  description: string;
  category: Exclude<CommandCategory, 'all'>;
  accent: 'mint' | 'blue' | 'indigo' | 'amber' | 'rose';
}

export interface CreatorProfile {
  name: string;
  short_name: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  instagram: string;
  portfolio: string;
  synced?: boolean;
}

export interface ConsoleLogEntry {
  id: string;
  time: string;
  message: string;
  level: 'info' | 'success' | 'error';
}

export const INITIAL_CLUSTER_NODES: ClusterNode[] = [
  { id: 's1', name: 'Node 1 (Heroku-1)', short: 'Heroku-1', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's2', name: 'Node 2 (Heroku-2)', short: 'Heroku-2', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's3', name: 'Node 3 (Heroku-3)', short: 'Heroku-3', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's4', name: 'Node 4 (Heroku-4)', short: 'Heroku-4', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's5', name: 'Node 5 (Heroku-5)', short: 'Heroku-5', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's6', name: 'Node 6 (Heroku-6)', short: 'Heroku-6', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's7', name: 'Node 7 (Heroku-7)', short: 'Heroku-7', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's8', name: 'Node 8 (Heroku-8)', short: 'Heroku-8', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's9', name: 'Node 9 (Heroku-9)', short: 'Heroku-9', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 's10', name: 'Node 10 (Heroku-10)', short: 'Heroku-10', type: 'Heroku', online: true, active: 0, ping: null },
  { id: 'railway', name: 'Node 11 (Railway)', short: 'Railway-11', type: 'Railway', online: true, active: 0, ping: null },
];

export const COMMAND_FILTERS: { key: CommandCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'music', label: 'Media' },
  { key: 'ai', label: 'AI & Utility' },
  { key: 'group', label: 'Group' },
  { key: 'fun', label: 'Greetings' },
];

export const BOT_COMMANDS: BotCommand[] = [
  {
    id: 'play',
    label: '.play <song>',
    copyText: '.play Believer',
    description: 'MP3 Song Download',
    category: 'music',
    accent: 'mint',
  },
  {
    id: 'ytmp4',
    label: '.ytmp4 <video>',
    copyText: '.ytmp4 funny video',
    description: 'HD Video Download',
    category: 'music',
    accent: 'mint',
  },
  {
    id: 'tt',
    label: '.tt <url>',
    copyText: '.tt https://vt.tiktok.com/...',
    description: 'TikTok No Watermark',
    category: 'music',
    accent: 'mint',
  },
  {
    id: 'ai',
    label: '.ai <query>',
    copyText: '.ai What is artificial intelligence?',
    description: 'Smart AI Chat Reply',
    category: 'ai',
    accent: 'blue',
  },
  {
    id: 'morning',
    label: '.morning / .gm',
    copyText: '.morning',
    description: 'Morning Wishes Card',
    category: 'fun',
    accent: 'amber',
  },
  {
    id: 'goodnight',
    label: '.goodnight / .gn',
    copyText: '.goodnight',
    description: 'Bedtime Card',
    category: 'fun',
    accent: 'indigo',
  },
  {
    id: 'thanks',
    label: '.thanks / .wlcm',
    copyText: '.thanks',
    description: 'Gratitude Auto Reply',
    category: 'fun',
    accent: 'indigo',
  },
  {
    id: 'tagall',
    label: '.tagall',
    copyText: '.tagall',
    description: 'Mention All Members',
    category: 'group',
    accent: 'mint',
  },
  {
    id: 'hidetag',
    label: '.hidetag <msg>',
    copyText: '.hidetag Urgent Announcement',
    description: 'Hidden Broadcast Tag',
    category: 'group',
    accent: 'mint',
  },
  {
    id: 'antilink',
    label: '.antilink on',
    copyText: '.antilink on',
    description: 'Auto Delete Group Links',
    category: 'group',
    accent: 'rose',
  },
  {
    id: 'weather',
    label: '.weather <city>',
    copyText: '.weather Lahore',
    description: 'Live Weather Forecast',
    category: 'ai',
    accent: 'blue',
  },
  {
    id: 'menu',
    label: '.menu',
    copyText: '.menu',
    description: 'All 700+ Bot Commands',
    category: 'ai',
    accent: 'blue',
  },
];

export const DEFAULT_CREATOR_PROFILE: CreatorProfile = {
  name: 'Muhammad Saqib',
  short_name: 'Saqib',
  tagline: 'Full-Stack Engineer & Cyber Security Specialist',
  bio: 'Full-stack web applications, SaaS engineering, and 24/7 WhatsApp multi-device automation.',
  email: 'mrsaqib242242@gmail.com',
  phone: '+92 346 8616487',
  whatsapp: 'https://wa.me/923464616487',
  location: 'Gojra, Faisalabad, Pakistan',
  instagram: 'https://www.instagram.com/mr_saqib242',
  portfolio: 'https://mrsaqib.me',
  synced: false,
};

export const DEVELOPER_AVATAR_URL =
  '/assets/images/saqib_developer_avatar.jpg';

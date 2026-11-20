# SIGMA MD – Official WhatsApp Multi-Device Bot Hub

Next.js Liquid Glass dashboard and pairing hub for **SIGMA MD WhatsApp Multi-Device Bot**, powered by an 11-node cloud cluster (10 Heroku Nodes + 1 Railway Node) with Smart Auto Load-Balancing, 8-digit phone pairing, QR code scanning, and live telemetry.

## Features

- **Next.js App Router**: Ultra-fast, static edge-cached deployment with zero Vercel Fluid Compute / Serverless Function consumption.
- **Direct Client-to-Heroku Architecture**: All WhatsApp pairing requests, QR sessions, and status polling execute directly from the client's browser to the backend cluster nodes.
- **Smart Auto Cluster Router**: Dynamic load-balancer and automatic failover across 10 Heroku nodes and 1 Railway node.
- **Liquid Glass Aesthetics**: Modern frosted glassmorphism interface with responsive telemetry, ambient lighting, and interactive mascot.
- **700+ Bot Commands Showcase**: Searchable and filterable catalog of WhatsApp bot capabilities.

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm or yarn / pnpm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production (Static SSG)
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy directly to **Vercel** or any static/Node.js host:
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next` (or standalone)
- Vercel Serverless Function Usage: **0 (Zero Fluid Compute used)**

---

Created with ❤️ by **Muhammad Saqib**

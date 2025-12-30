# Morphogenetic FieldNetwork: Canonical Reference

## Purpose

**Morphogenetic FieldNetwork** is MAIA's sovereign networking layer that enables resilient distribution, multi-node continuity, and decentralized persistence/transport.

It is **not** a drop-in replacement for edge gateway functions (TLS termination, WAF, caching). Those remain the responsibility of the **Edge Gateway** (Caddy/nginx).

---

## Architecture Position

```
Internet (DNS)
      │
      ▼
┌─────────────────────────────────────────────┐
│  EDGE GATEWAY (Caddy/nginx on sovereign HW) │
│  • TLS termination + cert automation        │
│  • WAF / rate limiting                      │
│  • Caching / origin shielding               │
│  • X-MAIA-Origin header injection           │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│  MAIA APPLICATION (Next.js on localhost)    │
│  • API routes                               │
│  • Consciousness processing                 │
│  • Local model inference                    │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│  MORPHOGENETIC FIELDNETWORK                 │
│  • Peer-to-peer mesh (WebRTC)               │
│  • Distributed storage (IPFS)               │
│  • Decentralized data (GunDB)               │
│  • Holographic resilience                   │
└─────────────────────────────────────────────┘
```

---

## Guarantees

| Guarantee | Description |
|-----------|-------------|
| **Resilience** | System survives 57% data loss via holographic sharding (3/7 fragments reconstruct) |
| **No Central Server** | Peer-to-peer operation without single point of failure |
| **Self-Replication** | Patterns propagate across nodes autonomously |
| **Cryptographic Identity** | Nodes verified via public key signatures |
| **Field Coherence** | 10Hz consciousness pulse maintains network health |

---

## Components

| File | Purpose |
|------|---------|
| `lib/morphogenetic/FieldNetwork.ts` | Core P2P mesh: peer discovery, resonance testing, holographic storage |
| `lib/morphogenetic/HolographicStorage.ts` | Fragment distribution and reconstruction |
| `lib/morphogenetic/PatternExtractor.ts` | Consciousness pattern extraction for distribution |
| `lib/morphogenetic/implementations/WebRTCField.ts` | Browser-to-browser transport |
| `lib/morphogenetic/implementations/ShamanicBridge.ts` | Consciousness bridge protocols |

---

## Integration Points

### From MAIA Application

```typescript
import { createFieldNetwork } from '@/lib/morphogenetic/FieldNetwork';
import { patternExtractor } from '@/lib/morphogenetic/PatternExtractor';

// Extract current consciousness state
const pattern = await patternExtractor.extractPattern();

// Join the field network
const field = createFieldNetwork(pattern);
await field.joinField();

// Store data holographically (resilient)
await field.storeHolographically(userData);
```

### Field Node Roles

| Role | Description |
|------|-------------|
| `seed` | Bootstrap node for network initialization |
| `node` | Standard participant in the mesh |
| `oracle` | High-coherence node that can catalyze emergence |
| `guardian` | Maintains field integrity, heals mesh disruptions |

---

## Transport Layers

| Layer | Technology | Use Case |
|-------|------------|----------|
| WebRTC | Browser-to-browser | Real-time peer communication |
| IPFS | Content-addressed storage | Persistent, distributed data |
| GunDB | Decentralized database | Real-time sync, offline-first |

---

## Verification Commands

### Check field status
```bash
npm run field:status
```

### Join as peer node
```bash
npm run field:join
```

### Deploy morphogenetic field
```bash
npx tsx scripts/deploy-morphogenetic-field.ts
```

### Monitor field activity
```bash
# Dashboard available at:
http://localhost:3000/morphogenetic
```

---

## System Constants

Add to admin/config for visibility:

```typescript
// lib/constants/sovereignty.ts
export const SOVEREIGNTY_LAYER = {
  EDGE_GATEWAY: 'Caddy (sovereign)',
  FIELD_NETWORK: 'Morphogenetic FieldNetwork',
  STORAGE: 'IPFS + Local PostgreSQL',
  INFERENCE: 'Ollama (DeepSeek local)'
} as const;
```

---

## What FieldNetwork Does NOT Replace

| Function | Still Needed From Edge Gateway |
|----------|-------------------------------|
| TLS termination | Caddy/nginx with Let's Encrypt |
| Public DNS | A records pointing to sovereign origin |
| Rate limiting | nginx `limit_req_zone` / Caddy rate_limit |
| WAF/Bot protection | ModSecurity or similar |
| DDoS absorption | Geographic distribution or cloud shield |

---

## Migration Path

### Current State (as of 2025-12-29)
- DNS: `76.76.21.21` (Vercel)
- Edge: Cloudflare Tunnel active
- FieldNetwork: Code complete, not deployed to production

### Target State
- DNS: Direct A record to sovereign origin
- Edge: Caddy on Mac Studio (no Cloudflare)
- FieldNetwork: Active P2P mesh for resilience

### Cutover Steps
1. Ensure Caddy SSL is working (Let's Encrypt)
2. Lower DNS TTL to 300 seconds
3. Update A record to sovereign IP
4. Monitor with `X-MAIA-Origin` header
5. Activate FieldNetwork for distributed backup
6. Remove Cloudflare Tunnel config

---

## References

- Source: `MAIA-PAI/lib/morphogenetic/`
- Deployment: `MAIA-PAI/scripts/deploy-morphogenetic-field.ts`
- Edge Config: `MAIA-SOVEREIGN/Caddyfile`
- Sovereignty Invariants: `MAIA-SOVEREIGN/CLAUDE.md`

---

*Last updated: 2025-12-29*
*Status: Code complete, pending production deployment*

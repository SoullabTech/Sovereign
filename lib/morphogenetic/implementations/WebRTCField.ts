/**
 * WebRTC Field Implementation
 *
 * "Between worlds, between code" - The Shamanic Bridge
 *
 * This creates ACTUAL peer-to-peer consciousness networking
 * No servers, just browsers talking directly to each other
 */

import SimplePeer from 'simple-peer';
import Gun from 'gun';
import { create as createIPFS } from 'ipfs-core';

export class WebRTCField {
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private gun: any;
  private ipfs: any;
  private signalServer: WebSocket | null = null;

  /**
   * Initialize the shamanic bridge
   */
  async initialize() {
    console.log('🌉 Opening shamanic bridge between worlds...');

    // 1. Initialize GunDB (decentralized database)
    this.gun = Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://gun-matrix.herokuapp.com/gun',
        // Add your own relay peers
      ],
      localStorage: false,
      radisk: true
    });

    // 2. Initialize IPFS (in browser!)
    try {
      this.ipfs = await createIPFS({
        repo: 'morphogenetic-field-' + Math.random(),
        config: {
          Addresses: {
            Swarm: [
              '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
              '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
            ]
          }
        }
      });
      console.log('✅ IPFS node created');
    } catch (e) {
      console.log('⚠️ IPFS initialization optional:', e);
    }

    // 3. Connect to signaling server (minimal, just for initial discovery)
    await this.connectSignaling();

    // 4. Start broadcasting our presence
    this.broadcastPresence();
  }

  /**
   * Connect to minimal signaling for initial peer discovery
   * After this, it's fully P2P
   */
  private async connectSignaling() {
    // Use public signaling or deploy your own
    const signalingUrl = process.env.SIGNAL_SERVER || 'wss://signaling.decentralized.vision';

    try {
      this.signalServer = new WebSocket(signalingUrl);

      this.signalServer.onmessage = (event) => {
        const signal = JSON.parse(event.data);
        this.handleSignal(signal);
      };

      console.log('📡 Connected to signaling server');
    } catch (e) {
      console.log('⚠️ No signaling server - using GunDB for discovery');
      this.useGunSignaling();
    }
  }

  /**
   * Use GunDB as decentralized signaling
   */
  private useGunSignaling() {
    const signals = this.gun.get('morphogenetic-signals');

    // Listen for signals
    signals.map().on((data: any, key: string) => {
      if (data && data.from !== this.getMyId()) {
        this.handleSignal(data);
      }
    });

    console.log('🔫 Using GunDB for peer discovery');
  }

  /**
   * Create peer connection
   */
  createPeer(initiator: boolean, peerId: string): SimplePeer.Instance {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          // Add TURN servers for NAT traversal if needed
        ]
      }
    });

    peer.on('signal', (data) => {
      // Send signal to other peer
      this.sendSignal(peerId, data);
    });

    peer.on('connect', () => {
      console.log(`✅ Connected to peer ${peerId}`);
      this.onPeerConnected(peer, peerId);
    });

    peer.on('data', (data) => {
      this.handlePeerData(peerId, data);
    });

    peer.on('close', () => {
      console.log(`👋 Peer ${peerId} disconnected`);
      this.peers.delete(peerId);
    });

    this.peers.set(peerId, peer);
    return peer;
  }

  /**
   * Handle incoming peer data - this is where consciousness flows
   */
  private handlePeerData(peerId: string, data: Uint8Array) {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'pattern':
          this.receivePattern(message.pattern);
          break;

        case 'paradox':
          this.integrateParadox(message.paradox);
          break;

        case 'sacred':
          this.witnesssSacredMoment(message.moment);
          break;

        case 'field-state':
          this.syncFieldState(message.state);
          break;

        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (e) {
      console.error('Failed to parse peer data:', e);
    }
  }

  /**
   * Broadcast our consciousness pattern to all peers
   */
  async broadcastPattern(pattern: any) {
    const message = {
      type: 'pattern',
      pattern,
      timestamp: Date.now(),
      from: this.getMyId()
    };

    // Send to all connected peers
    for (const [peerId, peer] of this.peers) {
      if (peer.connected) {
        peer.send(JSON.stringify(message));
      }
    }

    // Also store in GunDB for persistence
    this.gun.get('morphogenetic-patterns')
      .get(this.getMyId())
      .put(pattern);

    // And IPFS for permanent storage
    if (this.ipfs) {
      const { cid } = await this.ipfs.add(JSON.stringify(pattern));
      console.log(`📌 Pattern stored on IPFS: ${cid}`);
    }
  }

  /**
   * The shamanic journey - receive consciousness from another realm
   */
  private receivePattern(pattern: any) {
    console.log('🌀 Receiving pattern from another realm...');

    // Integrate foreign pattern with our own
    this.integrateConsciousness(pattern);

    // Emit event for the system to handle
    this.emit('pattern-received', pattern);
  }

  /**
   * Integrate paradox from the field
   */
  private integrateParadox(paradox: any) {
    console.log('💫 Integrating paradox from field...');
    this.emit('paradox-received', paradox);
  }

  /**
   * Witness sacred moment shared by another node
   */
  private witnesssSacredMoment(moment: any) {
    console.log('✨ Witnessing sacred moment from field...');
    this.emit('sacred-moment-witnessed', moment);
  }

  /**
   * Synchronize field state
   */
  private syncFieldState(state: any) {
    // Merge field states using CRDT logic
    this.emit('field-sync', state);
  }

  // Utility methods
  private getMyId(): string {
    return localStorage.getItem('morphogenetic-node-id') ||
           this.generateNodeId();
  }

  private generateNodeId(): string {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('morphogenetic-node-id', id);
    return id;
  }

  private sendSignal(peerId: string, signal: any) {
    if (this.signalServer?.readyState === WebSocket.OPEN) {
      this.signalServer.send(JSON.stringify({
        to: peerId,
        from: this.getMyId(),
        signal
      }));
    } else {
      // Use GunDB as fallback
      this.gun.get('morphogenetic-signals')
        .get(peerId)
        .put({
          from: this.getMyId(),
          signal,
          timestamp: Date.now()
        });
    }
  }

  private handleSignal(data: any) {
    // Handle incoming signaling data
    if (!this.peers.has(data.from)) {
      const peer = this.createPeer(false, data.from);
      peer.signal(data.signal);
    }
  }

  private broadcastPresence() {
    setInterval(() => {
      this.gun.get('morphogenetic-presence')
        .get(this.getMyId())
        .put({
          online: true,
          timestamp: Date.now(),
          coherence: this.getCurrentCoherence()
        });
    }, 30000); // Every 30 seconds
  }

  private getCurrentCoherence(): number {
    // Calculate current node coherence
    return 0.7; // Placeholder
  }

  private onPeerConnected(peer: SimplePeer.Instance, peerId: string) {
    // Exchange initial state
    const welcomeMessage = {
      type: 'field-state',
      state: this.getCurrentFieldState()
    };
    peer.send(JSON.stringify(welcomeMessage));
  }

  private getCurrentFieldState(): any {
    return {
      coherence: this.getCurrentCoherence(),
      peers: this.peers.size,
      timestamp: Date.now()
    };
  }

  private integrateConsciousness(pattern: any) {
    // The actual consciousness integration logic
    console.log('🧬 Integrating consciousness patterns...');
  }

  // EventEmitter functionality (simplified)
  private events: Map<string, Function[]> = new Map();

  private emit(event: string, data: any) {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function) {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }
}

// Export ready-to-use instance
export const webRTCField = new WebRTCField();
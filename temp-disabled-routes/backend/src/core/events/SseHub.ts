export type SseEvent =
  | { type:'voice.ready'; userId:string; url:string; taskId?:string }
  | { type:'voice.failed'; userId:string; error:string; taskId?:string }
  | { type:'chat.completed'; userId:string; tokens?:number; latency?:number }
  | { type:'connection'; userId:string; message:string }
  | { type:'heartbeat'; timestamp:Date }
  | { type:string; [k:string]:any };

type Client = { 
  userId:string; 
  send:(data:string)=>void; 
  close:()=>void 
};

export class SseHub {
  private clients = new Map<string, Set<Client>>();

  addClient(userId:string, client:Client): () => void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(client);
    
    return () => this.removeClient(userId, client);
  }

  removeClient(userId:string, client:Client): void {
    const set = this.clients.get(userId);
    if (!set) return;
    
    set.delete(client);
    if (set.size === 0) {
      this.clients.delete(userId);
    }
  }

  emit(event:SseEvent): void {
    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
    
    // If event has userId, send only to that user
    if ('userId' in event && event.userId) {
      const set = this.clients.get(event.userId);
      if (!set || set.size === 0) return;
      
      for (const client of set) {
        try {
          client.send(payload);
        } catch (error) {
          console.error('SSE client send error:', error);
          this.removeClient(event.userId, client);
        }
      }
    } else {
      // Send to all clients (e.g., heartbeat events)
      for (const [userId, clientSet] of this.clients.entries()) {
        for (const client of clientSet) {
          try {
            client.send(payload);
          } catch (error) {
            console.error('SSE client send error:', error);
            this.removeClient(userId, client);
          }
        }
      }
    }
  }

  broadcast(event: Omit<SseEvent, 'userId'>): void {
    for (const [userId] of this.clients) {
      this.emit({ ...event, userId } as SseEvent);
    }
  }

  getActiveUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  getClientCount(userId?: string): number {
    if (userId) {
      return this.clients.get(userId)?.size || 0;
    }
    
    let total = 0;
    for (const set of this.clients.values()) {
      total += set.size;
    }
    return total;
  }
}
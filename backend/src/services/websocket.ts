import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

interface Client {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = uuidv4();
      const client: Client = { id: clientId, ws, isAlive: true };
      this.clients.set(clientId, client);

      console.log(`WebSocket client connected: ${clientId} (total: ${this.clients.size})`);

      // Send welcome message with client ID
      this.sendToClient(clientId, 'connected', { clientId });

      ws.on('pong', () => {
        const c = this.clients.get(clientId);
        if (c) c.isAlive = true;
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          console.log(`Message from ${clientId}:`, message);
        } catch {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId} (total: ${this.clients.size})`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error.message);
        this.clients.delete(clientId);
      });
    });

    // Heartbeat ping every 30s
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, id) => {
        if (!client.isAlive) {
          client.ws.terminate();
          this.clients.delete(id);
          return;
        }
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000);

    console.log('WebSocket server initialized');
  }

  sendToClient(clientId: string, event: string, data: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ event, data }));
    }
  }

  broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.clients.forEach((client) => {
      client.ws.close();
    });
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Singleton export
export const wsManager = new WebSocketManager();

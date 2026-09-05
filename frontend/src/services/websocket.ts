// ============================================================
// IBVAP — WebSocket Service
// Manages real-time connection to FastAPI WebSocket endpoint
// ============================================================
import type { WebSocketMessage } from '../types';

type MessageHandler = (msg: WebSocketMessage) => void;
type StatusHandler = (connected: boolean) => void;

class IBVAPWebSocket {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 3000;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[IBVAP WS] Connected');
        this.reconnectDelay = 3000;
        this.statusHandlers.forEach(h => h(true));
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data) as WebSocketMessage;
          this.messageHandlers.forEach(h => h(msg));
        } catch (e) {
          console.warn('[IBVAP WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[IBVAP WS] Disconnected — reconnecting in', this.reconnectDelay, 'ms');
        this.statusHandlers.forEach(h => h(false));
        this.scheduleReconnect();
      };

      this.ws.onerror = (e) => {
        console.warn('[IBVAP WS] Error:', e);
      };
    } catch (e) {
      console.warn('[IBVAP WS] Could not connect:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new IBVAPWebSocket(
  `ws://${window.location.hostname}:8000/ws/events`
);

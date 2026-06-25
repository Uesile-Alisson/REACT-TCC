import { io, type Socket } from 'socket.io-client';
import { SOCKET_NAMESPACES } from './socket-events';

type RealtimeSocket = Socket;

const FALLBACK_SOCKET_URL = 'http://localhost:3000';

function stripApiSuffix(value: string): string {
  return value.replace(/\/api\/?$/, '');
}

function resolveSocketBaseUrl(): string {
  const envUrl =
    import.meta.env.VITE_SOCKET_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    FALLBACK_SOCKET_URL;

  return stripApiSuffix(String(envUrl).replace(/\/+$/, ''));
}

function createSocketUrl(namespace: string): string {
  return `${resolveSocketBaseUrl()}${namespace}`;
}

const realtimeSocket: RealtimeSocket = io(createSocketUrl(SOCKET_NAMESPACES.MQTT_HARDWARE), {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  auth: {},
});
let currentToken: string | null = null;

export function connectRealtime(token?: string | null): void {
  const nextToken = token ?? null;
  realtimeSocket.auth = nextToken ? { token: nextToken } : {};

  if (realtimeSocket.connected && currentToken !== nextToken) {
    realtimeSocket.disconnect();
  }

  currentToken = nextToken;

  if (!realtimeSocket.connected) {
    realtimeSocket.connect();
  }
}

export function disconnectRealtime(): void {
  currentToken = null;
  realtimeSocket.removeAllListeners();
  realtimeSocket.disconnect();
}

export function getRealtimeSocket(): RealtimeSocket {
  return realtimeSocket;
}

export function isRealtimeSocketConnected(): boolean {
  return realtimeSocket.connected;
}

export function onRealtimeEvent<TPayload>(
  eventName: string,
  listener: (payload: TPayload) => void,
): () => void {
  realtimeSocket.on(eventName, listener);

  return () => {
    realtimeSocket.off(eventName, listener);
  };
}

export function offRealtimeEvent<TPayload>(
  eventName: string,
  listener: (payload: TPayload) => void,
): void {
  realtimeSocket.off(eventName, listener);
}

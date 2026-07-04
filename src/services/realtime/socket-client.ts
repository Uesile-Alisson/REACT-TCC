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

const alarmesSocket: RealtimeSocket = io(createSocketUrl(SOCKET_NAMESPACES.ALARMES), {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  auth: {},
});

let currentToken: string | null = null;

const managedSockets: RealtimeSocket[] = [realtimeSocket, alarmesSocket];

export function connectRealtime(token?: string | null): void {
  const nextToken = token ?? null;

  managedSockets.forEach((socket) => {
    socket.auth = nextToken ? { token: nextToken } : {};

    if (socket.connected && currentToken !== nextToken) {
      socket.disconnect();
    }
  });

  currentToken = nextToken;

  managedSockets.forEach((socket) => {
    if (!socket.connected) {
      socket.connect();
    }
  });
}

export function disconnectRealtime(): void {
  currentToken = null;
  managedSockets.forEach((socket) => {
    socket.removeAllListeners();
    socket.disconnect();
  });
}

export function getRealtimeSocket(): RealtimeSocket {
  return realtimeSocket;
}

export function getAlarmesSocket(): RealtimeSocket {
  return alarmesSocket;
}

export function isRealtimeSocketConnected(): boolean {
  return realtimeSocket.connected;
}

export function isAlarmesSocketConnected(): boolean {
  return alarmesSocket.connected;
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

export function onAlarmesRealtimeEvent<TPayload>(
  eventName: string,
  listener: (payload: TPayload) => void,
): () => void {
  alarmesSocket.on(eventName, listener);

  return () => {
    alarmesSocket.off(eventName, listener);
  };
}

export function offRealtimeEvent<TPayload>(
  eventName: string,
  listener: (payload: TPayload) => void,
): void {
  realtimeSocket.off(eventName, listener);
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROCESSOS_EVENTS, SOCKET_SYSTEM_EVENTS } from './socket-events';

const socketHarness = vi.hoisted(() => {
  type Listener = (...args: unknown[]) => void;
  type FakeSocket = {
    connected: boolean;
    auth: Record<string, unknown>;
    listeners: Map<string, Set<Listener>>;
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    removeAllListeners: ReturnType<typeof vi.fn>;
    trigger: (event: string, ...args: unknown[]) => void;
  };

  const sockets: FakeSocket[] = [];
  const createSocket = (): FakeSocket => {
    const listeners = new Map<string, Set<Listener>>();
    const socket: FakeSocket = {
      connected: false,
      auth: {},
      listeners,
      on: vi.fn((event: string, listener: Listener): FakeSocket => {
        listeners.set(event, new Set([...(listeners.get(event) ?? []), listener]));
        return socket;
      }),
      off: vi.fn((event: string, listener: Listener) => {
        listeners.get(event)?.delete(listener);
        return socket;
      }),
      emit: vi.fn(() => socket),
      connect: vi.fn(() => {
        socket.connected = true;
        return socket;
      }),
      disconnect: vi.fn(() => {
        socket.connected = false;
        return socket;
      }),
      removeAllListeners: vi.fn(() => {
        listeners.clear();
        return socket;
      }),
      trigger: (event: string, ...args: unknown[]) => {
        listeners.get(event)?.forEach((listener) => listener(...args));
      },
    } satisfies FakeSocket;

    sockets.push(socket);
    return socket;
  };

  return { sockets, createSocket };
});

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => socketHarness.createSocket()),
}));

import {
  connectRealtime,
  disconnectRealtime,
  getAlarmesSocket,
  getProcessosSocket,
  getRealtimeSocket,
  isAlarmesSocketConnected,
  isProcessosSocketConnected,
  isRealtimeSocketConnected,
  joinProcessRoom,
  offRealtimeEvent,
  onAlarmesRealtimeEvent,
  onProcessosRealtimeEvent,
  onRealtimeEvent,
} from './socket-client';

describe('socket-client', () => {
  beforeEach(() => {
    socketHarness.sockets.forEach((socket) => {
      socket.connected = false;
      socket.auth = {};
      socket.listeners.clear();
      socket.on.mockClear();
      socket.off.mockClear();
      socket.emit.mockClear();
      socket.connect.mockClear();
      socket.disconnect.mockClear();
      socket.removeAllListeners.mockClear();
    });
  });

  it('conecta os três namespaces com o token e reconecta ao trocar a sessão', () => {
    connectRealtime('token-a');
    expect(socketHarness.sockets).toHaveLength(3);
    socketHarness.sockets.forEach((socket) => {
      expect(socket.auth).toEqual({ token: 'token-a' });
      expect(socket.connect).toHaveBeenCalledOnce();
    });

    connectRealtime('token-b');
    socketHarness.sockets.forEach((socket) => {
      expect(socket.disconnect).toHaveBeenCalledOnce();
      expect(socket.auth).toEqual({ token: 'token-b' });
      expect(socket.connect).toHaveBeenCalledTimes(2);
    });
  });

  it('reingressa na sala do processo após perda e retorno do Socket.IO', () => {
    const processSocket = socketHarness.sockets[2];
    processSocket.connected = true;

    const leave = joinProcessRoom(37);
    expect(processSocket.emit).toHaveBeenCalledWith(PROCESSOS_EVENTS.JOIN, { id_processo: 37 });

    processSocket.emit.mockClear();
    processSocket.connected = false;
    processSocket.trigger(SOCKET_SYSTEM_EVENTS.CONNECT);
    expect(processSocket.emit).toHaveBeenCalledWith(PROCESSOS_EVENTS.JOIN, { id_processo: 37 });

    processSocket.emit.mockClear();
    processSocket.connected = true;
    leave();
    expect(processSocket.off).toHaveBeenCalledWith(SOCKET_SYSTEM_EVENTS.CONNECT, expect.any(Function));
    expect(processSocket.emit).toHaveBeenCalledWith(PROCESSOS_EVENTS.LEAVE, { id_processo: 37 });
  });

  it('remove listeners e desconecta todos os namespaces no logout', () => {
    disconnectRealtime();

    socketHarness.sockets.forEach((socket) => {
      expect(socket.removeAllListeners).toHaveBeenCalledOnce();
      expect(socket.disconnect).toHaveBeenCalledOnce();
    });
  });

  it('registra e remove listeners nos namespaces corretos', () => {
    const listener = vi.fn();
    const stopMqtt = onRealtimeEvent('hardware:status', listener);
    const stopAlarm = onAlarmesRealtimeEvent('alarm:created', listener);
    const stopProcess = onProcessosRealtimeEvent('process:tank-updated', listener);

    socketHarness.sockets[0].trigger('hardware:status', { operacional: true });
    socketHarness.sockets[1].trigger('alarm:created', { id_alarme: 1 });
    socketHarness.sockets[2].trigger('process:tank-updated', { id_processo: 9 });
    expect(listener).toHaveBeenCalledTimes(3);

    stopMqtt();
    stopAlarm();
    stopProcess();
    offRealtimeEvent('hardware:status', listener);
    expect(socketHarness.sockets[0].off).toHaveBeenCalledWith('hardware:status', listener);
    expect(socketHarness.sockets[1].off).toHaveBeenCalledWith('alarm:created', listener);
    expect(socketHarness.sockets[2].off).toHaveBeenCalledWith('process:tank-updated', listener);
  });

  it('expõe conexão e instâncias separadas dos três namespaces', () => {
    socketHarness.sockets[0].connected = true;
    socketHarness.sockets[1].connected = false;
    socketHarness.sockets[2].connected = true;

    expect(getRealtimeSocket()).toBe(socketHarness.sockets[0]);
    expect(getAlarmesSocket()).toBe(socketHarness.sockets[1]);
    expect(getProcessosSocket()).toBe(socketHarness.sockets[2]);
    expect(isRealtimeSocketConnected()).toBe(true);
    expect(isAlarmesSocketConnected()).toBe(false);
    expect(isProcessosSocketConnected()).toBe(true);
  });
});

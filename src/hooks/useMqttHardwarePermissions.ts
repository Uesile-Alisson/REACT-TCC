import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { MqttHardwarePermissions } from '../types';

export function useMqttHardwarePermissions(): MqttHardwarePermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canUseTechnicalScreen = role === 'TECNICO' || role === 'ADMINISTRADOR';
  const canAdministerMqtt = role === 'ADMINISTRADOR';

  return useMemo(
    () => ({
      canViewMqttHardwareConfig: canUseTechnicalScreen,
      canEditMqttHardwareConfig: canAdministerMqtt,
      canRestartCommunication: canUseTechnicalScreen,
      canSyncHardware: canUseTechnicalScreen,
    }),
    [canAdministerMqtt, canUseTechnicalScreen],
  );
}

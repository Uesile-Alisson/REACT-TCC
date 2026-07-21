export const SOCKET_NAMESPACES = {
  MQTT_HARDWARE: '/mqtt-hardware',
  PROCESSOS: '/processos',
  ALARMES: '/alarmes',
} as const;

export const SOCKET_SYSTEM_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
} as const;

export const MQTT_HARDWARE_EVENTS = {
  SOCKET_CONNECTED: 'socket:connected',
  MQTT_CONNECTION_STATUS: 'mqtt:connection-status',
  MQTT_ERROR: 'mqtt:error',
  HARDWARE_STATE: 'hardware:state',
  SENSOR_READING: 'sensor:reading',
  HARDWARE_STATUS: 'hardware:status',
  HARDWARE_HEARTBEAT: 'hardware:heartbeat',
  ALARM_CREATED: 'alarm:created',
  SENSOR_ACOPLAMENTO_UPDATED: 'sensor-acoplamento:updated',
} as const;

export const PROCESSOS_EVENTS = {
  SOCKET_CONNECTED: 'process:socket-connected',
  JOIN: 'process:join',
  LEAVE: 'process:leave',
  JOINED: 'process:joined',
  LEFT: 'process:left',
  CREATED: 'process:created',
  STARTED: 'process:started',
  PAUSED: 'process:paused',
  RESUMED: 'process:resumed',
  FINISHED: 'process:finished',
  INTERRUPTED: 'process:interrupted',
  EMERGENCY_STOP: 'process:emergency-stop',
  FAILURE: 'process:failure',
  CONFIG_UPDATED: 'process:config-updated',
  METRICS_UPDATED: 'process:metrics-updated',
  DASHBOARD_UPDATED: 'process:dashboard-updated',
  AUXILIARY_STATE_UPDATED: 'process:auxiliary-state-updated',
  TANK_UPDATED: 'process:tank-updated',
  TANK_CLOSURE_UPDATED: 'process:tank-closure-updated',
  GENERAL_CLOSURE_UPDATED: 'process:general-closure-updated',
  PRECHECK_RESULT: 'process:precheck-result',
  STATUS_CHANGED: 'process:status-changed',
  ERROR: 'process:error',
} as const;

export const ALARMES_EVENTS = {
  SOCKET_CONNECTED: 'alarm:socket-connected',
  CREATED: 'alarm:created',
  UPDATED: 'alarm:updated',
  ACKNOWLEDGED: 'alarm:acknowledged',
  NORMALIZED: 'alarm:normalized',
  RESOLVED: 'alarm:resolved',
  RECOVERY_ATTEMPT: 'alarm:recovery-attempt',
  DASHBOARD_UPDATED: 'alarm:dashboard-updated',
  NOTIFICATION: 'alarm:notification',
} as const;

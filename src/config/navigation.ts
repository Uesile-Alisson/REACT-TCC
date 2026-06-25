import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  Gauge,
  HardDrive,
  History,
  LayoutDashboard,
  Settings,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import type { NivelAcesso } from '../types';

export type NavigationItem = {
  id: string;
  label: string;
  path: string;
  roles: NivelAcesso[];
  description: string;
  icon: LucideIcon;
};

export const ALL_ROLES: NivelAcesso[] = ['OPERADOR', 'TECNICO', 'ADMINISTRADOR'];

export const TECHNICAL_ROLES: NivelAcesso[] = ['TECNICO', 'ADMINISTRADOR'];

export const ADMIN_ROLES: NivelAcesso[] = ['ADMINISTRADOR'];

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard TSEA',
    path: '/dashboard',
    roles: ALL_ROLES,
    description: 'Visao geral do sistema',
    icon: LayoutDashboard,
  },
  {
    id: 'processos',
    label: 'Processos',
    path: '/processos',
    roles: ALL_ROLES,
    description: 'Operacao dos processos de vacuo',
    icon: Activity,
  },
  {
    id: 'alarmes',
    label: 'Alarmes',
    path: '/alarmes',
    roles: ALL_ROLES,
    description: 'Monitoramento e criticidade',
    icon: Bell,
  },
  {
    id: 'historico',
    label: 'Historico',
    path: '/historico',
    roles: ALL_ROLES,
    description: 'Consulta operacional historica',
    icon: History,
  },
  {
    id: 'relatorios',
    label: 'Relatorios',
    path: '/relatorios',
    roles: ALL_ROLES,
    description: 'PDF e XLSX conforme permissao',
    icon: ChartNoAxesCombined,
  },
  {
    id: 'configuracoes-sistema',
    label: 'Configuracoes do Sistema',
    path: '/configuracoes/sistema',
    roles: TECHNICAL_ROLES,
    description: 'Parametros gerais',
    icon: Settings,
  },
  {
    id: 'configuracoes-mqtt',
    label: 'Configuracoes MQTT/Hardware',
    path: '/configuracoes/mqtt-hardware',
    roles: TECHNICAL_ROLES,
    description: 'Conexao MQTT e hardware',
    icon: HardDrive,
  },
  {
    id: 'tanques',
    label: 'Tanques',
    path: '/configuracoes/tanques',
    roles: TECHNICAL_ROLES,
    description: 'Cadastro tecnico de tanques',
    icon: Gauge,
  },
  {
    id: 'bombas',
    label: 'Bombas',
    path: '/configuracoes/bombas',
    roles: TECHNICAL_ROLES,
    description: 'Cadastro tecnico de bombas',
    icon: Waves,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    path: '/usuarios',
    roles: ADMIN_ROLES,
    description: 'Gestao administrativa de acesso',
    icon: Users,
  },
];

export function canAccessNavigationItem(
  item: NavigationItem,
  role?: NivelAcesso | null,
): boolean {
  if (!role) {
    return item.roles.length === ALL_ROLES.length;
  }

  return item.roles.includes(role);
}

export function getNavigationItemByPath(pathname: string): NavigationItem | undefined {
  return navigationItems.find((item) => pathname === item.path);
}

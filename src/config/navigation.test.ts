import { describe, expect, it } from 'vitest';
import type { NivelAcesso } from '../types';
import { canAccessNavigationItem, getNavigationItemByPath, navigationItems } from './navigation';

describe('matriz de navegação por perfil', () => {
  it('mantém páginas operacionais para os três perfis', () => {
    const processItem = navigationItems.find((item) => item.path === '/processos');

    expect(processItem).toBeDefined();
    expect((['OPERADOR', 'TECNICO', 'ADMINISTRADOR'] as NivelAcesso[]).every((role) =>
      canAccessNavigationItem(processItem!, role))).toBe(true);
  });

  it('restringe configurações técnicas e administração', () => {
    const systemItem = navigationItems.find((item) => item.path === '/configuracoes/sistema');
    const usersItem = navigationItems.find((item) => item.path === '/usuarios');

    expect(canAccessNavigationItem(systemItem!, 'OPERADOR')).toBe(false);
    expect(canAccessNavigationItem(systemItem!, 'TECNICO')).toBe(true);
    expect(canAccessNavigationItem(usersItem!, 'TECNICO')).toBe(false);
    expect(canAccessNavigationItem(usersItem!, 'ADMINISTRADOR')).toBe(true);
  });

  it('resolve a rota exata e mantém o fallback público sem perfil', () => {
    expect(getNavigationItemByPath('/processos')?.id).toBe('processos');
    expect(getNavigationItemByPath('/processos/9')).toBeUndefined();
    expect(canAccessNavigationItem(navigationItems[0])).toBe(true);
    expect(canAccessNavigationItem(navigationItems.at(-1)!)).toBe(false);
  });
});

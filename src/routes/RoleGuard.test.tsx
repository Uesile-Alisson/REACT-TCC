import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextData } from '../contexts/AuthContextValue';
import type { NivelAcesso } from '../types';
import { RoleGuard } from './RoleGuard';

function authFor(role: NivelAcesso): AuthContextData {
  return {
    user: {
      id: 1,
      nome: role,
      login: role.toLowerCase(),
      email: `${role.toLowerCase()}@example.test`,
      nivel_acesso: role,
      primeiro_acesso: false,
    },
    accessToken: 'token-de-teste',
    isAuthenticated: true,
    isLoading: false,
    isFirstAccess: false,
    signin: vi.fn(),
    completeFirstAccess: vi.fn(),
    logout: vi.fn(),
  };
}

function renderGuard(role: NivelAcesso, roles: NivelAcesso[]) {
  return render(
    <AuthContext.Provider value={authFor(role)}>
      <MemoryRouter initialEntries={['/restrita']}>
        <Routes>
          <Route
            path="/restrita"
            element={<RoleGuard roles={roles}><div>Conteúdo autorizado</div></RoleGuard>}
          />
          <Route path="/access-denied" element={<div>Acesso negado</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('RoleGuard', () => {
  it.each([
    ['OPERADOR', ['OPERADOR', 'TECNICO', 'ADMINISTRADOR']],
    ['TECNICO', ['TECNICO', 'ADMINISTRADOR']],
    ['ADMINISTRADOR', ['ADMINISTRADOR']],
  ] as const)('autoriza o perfil %s quando a rota o inclui', (role, roles) => {
    renderGuard(role, [...roles]);

    expect(screen.getByText('Conteúdo autorizado')).toBeInTheDocument();
  });

  it.each([
    ['OPERADOR', ['TECNICO', 'ADMINISTRADOR']],
    ['TECNICO', ['ADMINISTRADOR']],
  ] as const)('redireciona o perfil %s sem permissão', (role, roles) => {
    renderGuard(role, [...roles]);

    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
  });
});

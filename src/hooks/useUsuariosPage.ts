import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
import { usersService } from '../services/users.service';
import type {
  CreateUserRequest,
  NivelAcesso,
  TemporaryCredentials,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UserResponse,
  UsuarioAction,
  UsuarioFeedback,
  UsuarioSummary,
} from '../types';

export const NIVEL_ACESSO_OPTIONS = [
  { id_nivel_acesso: 1, nivel_acesso: 'OPERADOR', label: 'Operador' },
  { id_nivel_acesso: 2, nivel_acesso: 'TECNICO', label: 'Tecnico' },
  { id_nivel_acesso: 3, nivel_acesso: 'ADMINISTRADOR', label: 'Administrador' },
] as const;

export function getUserAccessLevel(user: UserResponse): NivelAcesso {
  if (user.niveisacessos?.nome) {
    return user.niveisacessos.nome;
  }

  if (typeof user.nivel_acesso === 'string') {
    return user.nivel_acesso;
  }

  return user.nivel_acesso?.nome ?? 'OPERADOR';
}

export function getNivelAcessoId(level: NivelAcesso): number {
  return NIVEL_ACESSO_OPTIONS.find((option) => option.nivel_acesso === level)?.id_nivel_acesso ?? 1;
}

function getFriendlyUserError(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 400) {
    return apiError.message || 'Dados invalidos para usuario.';
  }

  if (apiError.statusCode === 401) {
    return 'Sessao expirada ou usuario nao autenticado.';
  }

  if (apiError.statusCode === 403) {
    return 'Seu perfil nao possui permissao para gerenciar usuarios.';
  }

  if (apiError.statusCode === 404) {
    return 'Usuario nao encontrado.';
  }

  if (apiError.statusCode === 409) {
    return apiError.message || 'Login ou e-mail ja cadastrado.';
  }

  if (apiError.statusCode === 500) {
    return 'Erro inesperado ao processar usuario.';
  }

  return apiError.message;
}

export function useUsuariosPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<UsuarioAction | null>(null);
  const [feedback, setFeedback] = useState<UsuarioFeedback>(null);
  const [temporaryCredentials, setTemporaryCredentials] = useState<TemporaryCredentials | null>(null);

  const summary = useMemo<UsuarioSummary>(() => {
    const base: UsuarioSummary = {
      total: users.length,
      administradores: 0,
      tecnicos: 0,
      operadores: 0,
      primeiroAcessoPendente: 0,
    };

    return users.reduce((current, user) => {
      const level = getUserAccessLevel(user);

      if (level === 'ADMINISTRADOR') {
        current.administradores += 1;
      }

      if (level === 'TECNICO') {
        current.tecnicos += 1;
      }

      if (level === 'OPERADOR') {
        current.operadores += 1;
      }

      if (user.primeiro_acesso) {
        current.primeiroAcessoPendente += 1;
      }

      return current;
    }, base);
  }, [users]);

  const loadUsers = useCallback(async (showLoading: boolean): Promise<UserResponse[]> => {
    if (showLoading) {
      setIsLoading(true);
      setFeedback(null);
    }

    try {
      const data = await usersService.listUsers();
      setUsers(data);
      setSelectedUser((current) =>
        current ? data.find((user) => user.id_usuario === current.id_usuario) ?? null : null,
      );
      return data;
    } catch (error) {
      setFeedback({ type: 'error', message: getFriendlyUserError(error) });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await loadUsers(true);
  }, [loadUsers]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUsers(): Promise<void> {
      const data = await usersService.listUsers().catch((error: unknown) => {
        if (isMounted) {
          setFeedback({ type: 'error', message: getFriendlyUserError(error) });
        }

        return [];
      });

      if (isMounted) {
        setUsers(data);
        setIsLoading(false);
      }
    }

    void loadInitialUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const createUser = useCallback(
    async (payload: CreateUserRequest): Promise<void> => {
      setActionLoading('create');
      setFeedback(null);

      try {
        const response = await usersService.createUser(payload);
        await refresh();
        setSelectedUser(response.user);
        setFeedback({ type: 'success', message: response.message });

        if (response.temporaryPassword) {
          setTemporaryCredentials({
            nome: response.user.nome,
            login: response.user.login,
            email: response.user.email,
            temporaryPassword: response.temporaryPassword,
            primeiro_acesso: response.user.primeiro_acesso,
          });
        }
      } catch (error) {
        setFeedback({ type: 'error', message: getFriendlyUserError(error) });
        throw error;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  const updateUser = useCallback(
    async (id: number, payload: UpdateUserRequest): Promise<void> => {
      setActionLoading('edit');
      setFeedback(null);

      try {
        const updatedUser = await usersService.updateUser(id, payload);
        await refresh();
        setSelectedUser(updatedUser);
        setFeedback({ type: 'success', message: 'Usuario atualizado com sucesso.' });
      } catch (error) {
        setFeedback({ type: 'error', message: getFriendlyUserError(error) });
        throw error;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  const updateUserRole = useCallback(
    async (id: number, payload: UpdateUserRoleRequest): Promise<void> => {
      setActionLoading('role');
      setFeedback(null);

      try {
        const updatedUser = await usersService.updateUserRole(id, payload);
        await refresh();
        setSelectedUser(updatedUser);
        setFeedback({ type: 'success', message: 'Nivel de acesso atualizado com sucesso.' });
      } catch (error) {
        setFeedback({ type: 'error', message: getFriendlyUserError(error) });
        throw error;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  const deleteUser = useCallback(
    async (id: number): Promise<void> => {
      setActionLoading('delete');
      setFeedback(null);

      try {
        const response = await usersService.deleteUser(id);
        setUsers((current) => current.filter((user) => user.id_usuario !== id));
        setSelectedUser((current) => (current?.id_usuario === id ? null : current));
        setFeedback({ type: 'success', message: response.message });
      } catch (error) {
        setFeedback({ type: 'error', message: getFriendlyUserError(error) });
        throw error;
      } finally {
        setActionLoading(null);
      }
    },
    [],
  );

  const clearFeedback = useCallback((): void => {
    setFeedback(null);
  }, []);

  const clearTemporaryCredentials = useCallback((): void => {
    setTemporaryCredentials(null);
  }, []);

  return {
    users,
    selectedUser,
    summary,
    isLoading,
    actionLoading,
    feedback,
    temporaryCredentials,
    selectUser: setSelectedUser,
    refresh,
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    clearFeedback,
    clearTemporaryCredentials,
  };
}

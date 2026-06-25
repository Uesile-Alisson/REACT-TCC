import { api } from '../api/axios';
import type {
  CreateUserResponse,
  CreateUserRequest,
  DeleteUserResponse,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UserResponse,
} from '../types/users.types';

export async function createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
  const { data } = await api.post<CreateUserResponse>('/user', payload);

  return data;
}

export async function listUsers(): Promise<UserResponse[]> {
  const { data } = await api.get<UserResponse[]>('/user');

  return data;
}

export async function getUserById(id: number): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`/user/${id}`);

  return data;
}

export async function updateUser(id: number, payload: UpdateUserRequest): Promise<UserResponse> {
  const { data } = await api.patch<UserResponse>(`/user/${id}`, payload);

  return data;
}

export async function updateUserRole(
  id: number,
  payload: UpdateUserRoleRequest,
): Promise<UserResponse> {
  const { data } = await api.patch<UserResponse>(`/user/${id}/role`, payload);

  return data;
}

export async function deleteUser(id: number): Promise<DeleteUserResponse> {
  const { data } = await api.delete<DeleteUserResponse>(`/user/${id}`);

  return data;
}

export const usersService = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
};

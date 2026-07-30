import apiClient from '../api/apiClient';
import { Usuario, UsuarioRequest } from '../types/Usuario';

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Usuario[]>('/usuarios');
    return data;
  },

  async buscarPorId(id: number): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return data;
  },

  async crear(request: UsuarioRequest): Promise<Usuario> {
    const { data } = await apiClient.post<Usuario>('/usuarios', request);
    return data;
  },

  async actualizar(id: number, request: UsuarioRequest): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(`/usuarios/${id}`, request);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/usuarios/${id}`);
  },
};

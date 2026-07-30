import apiClient from '../api/apiClient';
import { Prestamo, PrestamoRequest } from '../types/Prestamo';

export const prestamoService = {
  async registrar(request: PrestamoRequest): Promise<Prestamo> {
    const { data } = await apiClient.post<Prestamo>('/prestamos', request);
    return data;
  },

  async devolver(id: number): Promise<Prestamo> {
    const { data } = await apiClient.put<Prestamo>(`/prestamos/${id}/devolver`);
    return data;
  },

  async listarPorUsuario(usuarioId: number): Promise<Prestamo[]> {
    const { data } = await apiClient.get<Prestamo[]>(`/prestamos/usuario/${usuarioId}`);
    return data;
  },

  async listarPorIsbn(isbn: string): Promise<Prestamo[]> {
    const { data } = await apiClient.get<Prestamo[]>(`/prestamos/libro/${isbn}`);
    return data;
  },
};

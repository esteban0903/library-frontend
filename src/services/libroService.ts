import apiClient from '../api/apiClient';
import { Libro, LibroRequest } from '../types/Libro';
import { Ejemplar } from '../types/Ejemplar';

export const libroService = {
  async listar(): Promise<Libro[]> {
    const { data } = await apiClient.get<Libro[]>('/libros');
    return data;
  },

  async buscarPorId(id: number): Promise<Libro> {
    const { data } = await apiClient.get<Libro>(`/libros/${id}`);
    return data;
  },

  async crear(request: LibroRequest): Promise<Libro> {
    const { data } = await apiClient.post<Libro>('/libros', request);
    return data;
  },

  async actualizar(id: number, request: LibroRequest): Promise<Libro> {
    const { data } = await apiClient.put<Libro>(`/libros/${id}`, request);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/libros/${id}`);
  },

  async obtenerDisponibles(isbn: string): Promise<number> {
    const { data } = await apiClient.get<number>(`/libros/isbn/${isbn}/disponibles`);
    return data;
  },

  async listarEjemplaresDisponibles(isbn: string): Promise<Ejemplar[]> {
    const { data } = await apiClient.get<Ejemplar[]>(`/libros/isbn/${isbn}/ejemplares`);
    return data;
  },

  async listarTodosEjemplaresDisponibles(): Promise<Ejemplar[]> {
    const { data } = await apiClient.get<Ejemplar[]>('/libros/ejemplares/disponibles');
    return data;
  },

  async listarEjemplaresPorLibro(libroId: number): Promise<Ejemplar[]> {
    const { data } = await apiClient.get<Ejemplar[]>(`/libros/${libroId}/ejemplares`);
    return data;
  },

  async crearEjemplar(libroId: number, codigo: string): Promise<Ejemplar> {
    const { data } = await apiClient.post<Ejemplar>(`/libros/${libroId}/ejemplares`, { codigo });
    return data;
  },

  async eliminarEjemplar(ejemplarId: number): Promise<void> {
    await apiClient.delete(`/libros/ejemplares/${ejemplarId}`);
  },
};

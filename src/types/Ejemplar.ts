export type EstadoEjemplar = 'DISPONIBLE' | 'PRESTADO';

export interface Ejemplar {
  id: number;
  codigo: string;
  estado: EstadoEjemplar;
  isbn: string;
  tituloLibro: string;
}

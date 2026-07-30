export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';

export interface Prestamo {
  id: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estadoPrestamo: EstadoPrestamo;
  usuarioId: number;
  nombreUsuario: string;
  ejemplarId: number;
  codigoEjemplar: string;
  libroId: number;
  tituloLibro: string;
  isbn: string;
}

export interface PrestamoRequest {
  usuarioId: number;
  ejemplarId: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
}

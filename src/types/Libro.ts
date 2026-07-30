export interface Libro {
  id: number;
  titulo: string;
  isbn: string;
  autor: string;
  edicion: string | null;
  fechaPublicacion: string;
  ejemplaresDisponibles: number;
}

export interface LibroRequest {
  titulo: string;
  isbn: string;
  autor: string;
  edicion: string | null;
  fechaPublicacion: string;
}

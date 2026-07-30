export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
}

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
}

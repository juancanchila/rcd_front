export class Usuario {
  constructor(
    public id: number,
    public usuario: string,
    public nombre: string,
    public email: string,
    public rol: string,
    public id_rol: number,
    public token: string
  ) {}

  static fromLoginResponse(response: any): Usuario {
    return new Usuario(
      response.idusuario,
      response.usuario,
      response.nombre,
      response.email,
      response.rol,
      response.id_rol,
      response.token
    );
  }
}
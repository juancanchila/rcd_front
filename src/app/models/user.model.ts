export class User {
  constructor(
    public id: number,
    public usuario: string,
    public nombre: string,
    public email: string,
    public estado: string,
    public id_rol: number,
    public rol: string
  ) {}

  static fromResponse(response: any): User {
    return new User(
      response.idusuario,
      response.usuario,
      response.nombre,
      response.email,
      response.estado,
      response.id_rol,
      response.Rol?.rol || ''
    );
  }
}

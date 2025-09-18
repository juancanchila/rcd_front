export class Rol {
  constructor(
    public id_rol: number,
    public rol: string,
    public descripcion: string
  ) {}

  static fromResponse(response: any): Rol {
    return new Rol(
      response.id_rol,
      response.rol,
      response.descripcion
    );
  }
}

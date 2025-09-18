export class Resolucion {
  constructor(
    public id: number,
    public numeroResolucion: string,
    public ubicacion: string,
    public localidad: string | null,
    public naturalezaActividad: string,
    public tipoAprovechamiento: string,
    public fechaInicio: string,
    public fechaFin: string,
    public cantidadRCD: string,
    public CoordenadaX: string | null,
    public CoordenadaY: string | null,
    public fechaExpedicionPIN: string,
    public codigoRadicadoSIGOD: string,
    public idReceptor: number,
    public pin: string
  ) {}

  static fromResponse(response: any): Resolucion {
    return new Resolucion(
      response.idresolucion,
      response.numeroResolucion,
      response.ubicacion,
      response.localidad,
      response.naturalezaActividad,
      response.tipoAprovechamiento,
      response.fechaInicio,
      response.fechaFin,
      response.cantidadRCD,
      response.CoordenadaX,
      response.CoordenadaY,
      response.fechaExpedicionPIN,
      response.codigoRadicadoSIGOD,
      response.idReceptor,
      response.pin
    );
  }
}
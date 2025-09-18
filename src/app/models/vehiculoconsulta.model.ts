export class VehiculoConsulta {
  constructor(
    public idvehiculo: number,
    public placaVehiculo: string,
    public lugarExpedicion: string,
    public modelo: string,
    public capacidad: string | null,
    public fechaUltimaRevTecMec: string | null,
    public permisoMovilizacion: string | null,
    public nombreConductor: string | null,
    public numeroIdentificacion: string | null,
    public fotoFrente: string | null,
    public fotoLadoDerecho: string | null,
    public fotoLadoIzquierdo: string | null,
    public fotoTrasera: string | null,
    public idtransportador: number,
    public pin: string,
    public licenciaTransito: string | null,
    public certificadoRevTecMec: string | null,
    public fechaExpedicionPIN: string | null,
    public fechaVencimientoPIN: string | null,
    public codigoRadicadoSIGOD: string | null
  ) {}

  static fromResponse(response: any): VehiculoConsulta {
    return new VehiculoConsulta(
      response.idvehiculo,
      response.placaVehiculo,
      response.lugarExpedicion,
      response.modelo,
      response.capacidad,
      response.fechaUltimaRevTecMec,
      response.permisoMovilizacion,
      response.nombreConductor,
      response.numeroIdentificacion,
      response.fotoFrente,
      response.fotoLadoDerecho,
      response.fotoLadoIzquierdo,
      response.fotoTrasera,
      response.idtransportador,
      response.pin,
      response.licenciaTransito,
      response.certificadoRevTecMec,
      response.fechaExpedicionPIN,
      response.fechaVencimientoPIN,
      response.codigoRadicadoSIGOD
    );
  }
}

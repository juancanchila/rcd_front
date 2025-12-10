import { Transportador } from './transportador.model';

export class Vehiculo {
  constructor(
    public id: number,
    public placaVehiculo: string,
    public lugarExpedicion: string,
    public modelo: string,
    public capacidad: string,
    public fechaUltimaRevTecMec: string,
    public permisoMovilizacion: string,
    public nombreConductor: string | null,
    public numeroIdentificacion: string | null,
    public fotoFrente: string,
    public fotoLadoDerecho: string,
    public fotoLadoIzquierdo: string,
    public fotoTrasera: string,
    public idtransportador: number,
    public pin: string,
    public licenciaTransito: string,
    public certificadoRevTecMec: string | null,
    public fechaExpedicionPIN: string,
    public fechaVencimientoPIN: string,
    public fechaInicio: string,
    public codigoRadicadoSIGOD: string,
    public transportador: Transportador | null
  ) {}

  static fromResponse(response: any): Vehiculo {
    return new Vehiculo(
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
      response.fechaInicio,
      response.codigoRadicadoSIGOD,
      response.transportador ? Transportador.fromResponse(response.transportador) : null
    );
  }

  // 🔹 getter opcional para la tabla
  get nombreTransportador(): string {
    if (!this.transportador) return '';
    return [
      this.transportador.primerApellidos,
      this.transportador.segundoApellido,
      this.transportador.razonSocial
    ]
      .filter(v => v && v.trim() !== '')
      .join(', ');
  }
}

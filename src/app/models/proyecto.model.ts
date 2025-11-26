import { VisitaTecnica } from './visitatecnica.model';

export class Proyecto {
  constructor(
    public id: number,
    public nombre: string,
    public ubicacion: string,
    public tipoUsoPredio: string,
    public localidad: string,
    public barrio: string,
    public matriculaInmobiliaria: string,
    public referenciaCatastral: string | null,
    public fechaInicio: string,
    public fechaFin: string,
    public estadoProyecto: string,
    public numLicenciaUrbanismo: string,
    public fechaExpLicUrb: string,
    public titularLicUrb: string,
    public tipoIdentLicUrb: string,
    public identificacionLicUrb: string,
    public curaduria: string,
    public areaVerdes: string | null,
    public areaConstruccionAprobada: string,
    public valor: string,
    public volumenEstimGenrEscombros: string,
    public volumenEstimEscavaciones: string,
    public idgenerador: number,
    public generador: string,
    public pin: string,
    public fechaExpedicionPIN: string,
    public codigoRadicadoSIGOD: string,
    public CoordenadaX: string,
    public CoordenadaY: string,
    public visitas: VisitaTecnica[] | null
  ) {}

  static fromResponse(response: any): Proyecto {
    return new Proyecto(
      response.idProyecto,
      response.nombre,
      response.ubicacion,
      response.tipoUsoPredio,
      response.localidad,
      response.barrio,
      response.matriculaInmobiliaria,
      response.referenciaCatastral,
      response.fechaInicio,
      response.fechaFin,
      response.estadoProyecto,
      response.numLicenciaUrbanismo,
      response.fechaExpLicUrb,
      response.titularLicUrb,
      response.tipoIdentLicUrb,
      response.identificacionLicUrb,
      response.curaduria,
      response.areaVerdes,
      response.areaConstruccionAprobada,
      response.valor,
      response.volumenEstimGenrEscombros,
      response.volumenEstimEscavaciones,
      response.idgenerador,         // ✔ idgenerador
      response.generador,           // ✔ generador
      response.pin,                 // ✔ pin
      response.fechaExpedicionPIN,  // ✔ fechaExpedicionPIN
      response.codigoRadicadoSIGOD, // ✔ codigoRadicadoSIGOD
      response.CoordenadaX,         // ✔ CoordenadaX
      response.CoordenadaY,         // ✔ CoordenadaY
      response.visitas || null      // ✔ visitas
    );
  }
}

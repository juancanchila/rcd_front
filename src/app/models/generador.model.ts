// models/generador.model.ts
import { Proyecto } from './proyecto.model';

export class Generador {
  constructor(
    public id: number,
    public tipoDocumento: string,
    public numeroDocumento: string,
    public primerNombre: string | null,
    public segundoNombre: string | null,
    public primerApellidos: string | null,
    public segundoApellido: string | null,
    public razonSocial: string,
    public documentoIdentificacion: string | null,
    public documentoRUT: string | null,
    public tipoRegistro: string,
    public contratistaDe: string,
    public direccion: string,
    public correoElectronico: string,
    public telefono: string | number | null,
    public fax: string | null,
    public celular: string,
    public clave: string,
    public ciiu: string | null,
    public tipoDocumentoRL: string,
    public numeroDocumentoRL: string,
    public nombreRL: string,
    public emailRL: string | null,
    public proyectos: Proyecto[] | null // <-- agregado
  ) {}

  static fromResponse(response: any): Generador {
    return new Generador(
      response.idgenerador,
      response.tipoDocumento,
      response.numeroDocumento,
      response.primerNombre,
      response.segundoNombre,
      response.primerApellidos,
      response.segundoApellido,
      response.razonSocial,
      response.documentoIdentificacion,
      response.documentoRUT,
      response.tipoRegistro,
      response.contratistaDe,
      response.direccion,
      response.correoElectronico,
      response.telefono,
      response.fax,
      response.celular,
      response.clave,
      response.ciiu,
      response.tipoDocumentoRL,
      response.numeroDocumentoRL,
      response.nombreRL,
      response.emailRL,
      response.proyectos
        ? response.proyectos.map((p: any) => Proyecto.fromResponse(p))
        : null
    );
  }
}
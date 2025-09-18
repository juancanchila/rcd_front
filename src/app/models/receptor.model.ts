import { Resolucion } from './resolucion.model';
export class Receptor {
  constructor(
    public id: number,
    public tipoDocumento: string,
    public numeroDocumento: string,
    public primerNombre: string | null,
    public segundoNombre: string | null,
    public primerApellidos: string | null,
    public segundoApellido: string | null,
    public razonSocial: string,
    public direccion: string,
    public correoElectronico: string,
    public telefono: string | number,
    public fax: string | null,
    public celular: string | null,
    public clave: string,
    public ciiu: string | null,
    public tipoDocumentoRL: string,
    public numeroDocumentoRL: string,
    public nombreRL: string,
    public emailRL: string,
    public pin: string,
    public resoluciones: Resolucion[] | null // <-- agregado
  ) {}

  static fromResponse(response: any): Receptor {
    return new Receptor(
      response.idreceptor,
      response.tipoDocumento,
      response.numeroDocumento,
      response.primerNombre,
      response.segundoNombre,
      response.primerApellidos,
      response.segundoApellido,
      response.razonSocial,
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
      response.pin,
      response.resoluciones
    );
  }
}
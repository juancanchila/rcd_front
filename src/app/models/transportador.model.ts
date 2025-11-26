import { Vehiculo } from './vehiculo.model';
export class Transportador {
  constructor(
    public id: number,
    public tipoDocumento: string,
    public numeroDocumento: string,
    public primerNombre: string,
    public segundoNombre: string,
    public primerApellidos: string,
    public segundoApellido: string,
    public razonSocial: string | null,
    public documentoIdentificacion: string,
    public documentoRUT: string,
    public direccion: string,
    public correoElectronico: string,
    public telefono: number,
    public cert_ext_legal: string,
    public fax: string,
    public celular: string,
    public clave: string,
    public ciiu: string | null,
    public tipoDocumentoRL: string | null,
    public numeroDocumentoRL: string | null,
    public nombreRL: string | null,
    public emailRL: string | null,
    public Vehiculos: Vehiculo[] | null // <-- agregado

  ) {}

  static fromResponse(r: any): Transportador {
    return new Transportador(
      r.idtransportador,
      r.tipoDocumento,
      r.numeroDocumento,
      r.primerNombre,
      r.segundoNombre,
      r.primerApellidos,
      r.segundoApellido,
      r.razonSocial,
      r.documentoIdentificacion,
      r.cert_ext_legal,
      r.documentoRUT,
      r.direccion,
      r.correoElectronico,
      r.telefono,
      r.fax,
      r.celular,
      r.clave,
      r.ciiu,
      r.tipoDocumentoRL,
      r.numeroDocumentoRL,
      r.nombreRL,
      r.emailRL,
      r.Vehiculos 
    );
  }
}
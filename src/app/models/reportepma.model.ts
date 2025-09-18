export class ReporteSRCD {
  constructor(
    public id: number,
    public fechaReporte: string,
    public reportesRCD: string,
    public volumenEstmRCD: string,
    public fechaRegistro: string | null,
    public documento: string,
    public idProyecto: number,
    public transportador_idtransportador: number,
    public idreceptor: number
  ) {}

  static fromResponse(response: any): ReporteSRCD { 
    return new ReporteSRCD(
      response.idreportesRCDGen,
      response.fechaReporte,
      response.reportesRCD,
      response.volumenEstmRCD,
      response.fechaRegistro,
      response.documento,
      response.idProyecto,
      response.transportador_idtransportador,
      response.idreceptor
    );
  }
}
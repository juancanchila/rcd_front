// src/app/models/visitatecnica.model.ts
import { Proyecto } from './proyecto.model';

export class VisitaTecnica {
  constructor(
    public id: number,
    public fechaCreacion: string,
    public estado: string,
    public fechaVisita: string,
    public idTecnico: number | null,
    public estadoProyecto: string,
    public observaciones: string | null,
    public idProyecto: number,
    public acta: string | null,
    public proyecto?: Proyecto   // 🔹 Aquí guardamos el proyecto completo
  ) {}

  static fromResponse(response: any): VisitaTecnica {
    return new VisitaTecnica(
      response.idvisitatecnica,
      response.fechaCreacion,
      response.estado,
      response.fechaVisita,
      response.idTecnico,
      response.estadoProyecto,
      response.observaciones,
      response.idProyecto,
      response.acta,
      response.proyecto ? Proyecto.fromResponse(response.proyecto) : undefined
    );
  }
}

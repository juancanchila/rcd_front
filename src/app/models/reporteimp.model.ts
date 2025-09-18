// src/app/models/reporteimp-pma.model.ts
import { Proyecto } from './proyecto.model';

export class ReporteImpPmaRcd {
  constructor(
    public id: number,
    public idproyecto: number,
    public fechapresentacionreporte: string,
    public fechainicioreporte: string,
    public fechafinalreporte: string,
    public observaciones: string | null,
    public formato: string,

    // RCD susceptibles
    public rcd_sus_apro_apro_obra: number,
    public rcd_sus_apro_entr_punto_limpio: number,
    public rcd_sus_apro_entr_planta_aprov: number,
    public rcd_sus_apro_entr_sitio_disp_final: number,
    public rcd_sus_apro_total: number,

    public rcd_sus_apro_1_1_apro_obra: number,
    public rcd_sus_apro_1_1_entr_punto_limpio: number,
    public rcd_sus_apro_1_1_entr_planta_aprov: number,
    public rcd_sus_apro_1_1_entr_sitio_disp_final: number,
    public rcd_sus_apro_1_1_total: number,

    public rcd_sus_apro_1_2_apro_obra: number,
    public rcd_sus_apro_1_2_entr_punto_limpio: number,
    public rcd_sus_apro_1_2_entr_planta_aprov: number,
    public rcd_sus_apro_1_2_entr_sitio_disp_final: number,
    public rcd_sus_apro_1_2_total: number,

    public rcd_sus_apro_1_3_apro_obra: number,
    public rcd_sus_apro_1_3_entr_punto_limpio: number,
    public rcd_sus_apro_1_3_entr_planta_aprov: number,
    public rcd_sus_apro_1_3_entr_sitio_disp_final: number,
    public rcd_sus_apro_1_3_total: number,

    public rcd_sus_apro_1_4_apro_obra: number,
    public rcd_sus_apro_1_4_entr_punto_limpio: number,
    public rcd_sus_apro_1_4_entr_planta_aprov: number,
    public rcd_sus_apro_1_4_entr_sitio_disp_final: number,
    public rcd_sus_apro_1_4_total: number,

    // RCD no susceptibles
    public rcd_no_sus_apro_apro_obra: number,
    public rcd_no_sus_apro_entr_punto_limpio: number,
    public rcd_no_sus_apro_entr_planta_aprov: number,
    public rcd_no_sus_apro_entr_sitio_disp_final: number,
    public rcd_no_sus_apro_total: number,

    public rcd_no_sus_apro_2_1_apro_obra: number,
    public rcd_no_sus_apro_2_1_entr_punto_limpio: number,
    public rcd_no_sus_apro_2_1_entr_planta_aprov: number,
    public rcd_no_sus_apro_2_1_entr_sitio_disp_final: number,
    public rcd_no_sus_apro_2_1_total: number,

    public rcd_no_sus_apro_2_2_apro_obra: number,
    public rcd_no_sus_apro_2_2_entr_punto_limpio: number,
    public rcd_no_sus_apro_2_2_entr_planta_aprov: number,
    public rcd_no_sus_apro_2_2_entr_sitio_disp_final: number,
    public rcd_no_sus_apro_2_2_total: number,

    public rcd_no_sus_apro_2_3_apro_obra: number,
    public rcd_no_sus_apro_2_3_entr_punto_limpio: number,
    public rcd_no_sus_apro_2_3_entr_planta_aprov: number,
    public rcd_no_sus_apro_2_3_entr_sitio_disp_final: number,
    public rcd_no_sus_apro_2_3_total: number,

    // Indicadores
    public ind_cant_mat_const_usado_obra: number,
    public ind_cant_rcd_generado_obra: number,
    public ind_cant_rcd_aprovechado_obra: number,
    public ind_cant_rcd_recibo_punto_limpio: number,
    public ind_cant_rcd_recibo_planta_aprov: number,
    public ind_cant_rcd_llevado_sitio_dispos_final: number,

    // Metas
    public meta_mater_const_util_obra_fabri_de_rcd_tonelada: number,
    public meta_mater_const_util_obra_fabri_de_rcd_porcentaje: number,
    public meta_rcd_aprovechado_en_obra_tonelada: number,
    public meta_rcd_aprovechado_en_obra_porcentaje: number,
    public meta_rcd_entregado_planta_aprovechamiento_tonelada: number,
    public meta_rcd_entregado_planta_aprovechamiento_porcentaje: number,
    public meta_total_tonelada: number,
    public meta_total_porcentaje: number,

    // Relación con Proyecto
    public proyecto?: Proyecto,
    public proyectoNombre?: string
  ) {}

  static fromResponse(r: any): ReporteImpPmaRcd {
    const proyecto = r.proyecto ? Proyecto.fromResponse(r.proyecto) : undefined;
    const proyectoNombre = r.proyectoNombre ?? proyecto?.nombre;

    return new ReporteImpPmaRcd(
      r.idreporte,
      r.idproyecto,
      r.fechapresentacionreporte,
      r.fechainicioreporte,
      r.fechafinalreporte,
      r.observaciones,
      r.formato,

      r.rcd_sus_apro_apro_obra,
      r.rcd_sus_apro_entr_punto_limpio,
      r.rcd_sus_apro_entr_planta_aprov,
      r.rcd_sus_apro_entr_sitio_disp_final,
      r.rcd_sus_apro_total,

      r.rcd_sus_apro_1_1_apro_obra,
      r.rcd_sus_apro_1_1_entr_punto_limpio,
      r.rcd_sus_apro_1_1_entr_planta_aprov,
      r.rcd_sus_apro_1_1_entr_sitio_disp_final,
      r.rcd_sus_apro_1_1_total,

      r.rcd_sus_apro_1_2_apro_obra,
      r.rcd_sus_apro_1_2_entr_punto_limpio,
      r.rcd_sus_apro_1_2_entr_planta_aprov,
      r.rcd_sus_apro_1_2_entr_sitio_disp_final,
      r.rcd_sus_apro_1_2_total,

      r.rcd_sus_apro_1_3_apro_obra,
      r.rcd_sus_apro_1_3_entr_punto_limpio,
      r.rcd_sus_apro_1_3_entr_planta_aprov,
      r.rcd_sus_apro_1_3_entr_sitio_disp_final,
      r.rcd_sus_apro_1_3_total,

      r.rcd_sus_apro_1_4_apro_obra,
      r.rcd_sus_apro_1_4_entr_punto_limpio,
      r.rcd_sus_apro_1_4_entr_planta_aprov,
      r.rcd_sus_apro_1_4_entr_sitio_disp_final,
      r.rcd_sus_apro_1_4_total,

      r.rcd_no_sus_apro_apro_obra,
      r.rcd_no_sus_apro_entr_punto_limpio,
      r.rcd_no_sus_apro_entr_planta_aprov,
      r.rcd_no_sus_apro_entr_sitio_disp_final,
      r.rcd_no_sus_apro_total,

      r.rcd_no_sus_apro_2_1_apro_obra,
      r.rcd_no_sus_apro_2_1_entr_punto_limpio,
      r.rcd_no_sus_apro_2_1_entr_planta_aprov,
      r.rcd_no_sus_apro_2_1_entr_sitio_disp_final,
      r.rcd_no_sus_apro_2_1_total,

      r.rcd_no_sus_apro_2_2_apro_obra,
      r.rcd_no_sus_apro_2_2_entr_punto_limpio,
      r.rcd_no_sus_apro_2_2_entr_planta_aprov,
      r.rcd_no_sus_apro_2_2_entr_sitio_disp_final,
      r.rcd_no_sus_apro_2_2_total,

      r.rcd_no_sus_apro_2_3_apro_obra,
      r.rcd_no_sus_apro_2_3_entr_punto_limpio,
      r.rcd_no_sus_apro_2_3_entr_planta_aprov,
      r.rcd_no_sus_apro_2_3_entr_sitio_disp_final,
      r.rcd_no_sus_apro_2_3_total,

      r.ind_cant_mat_const_usado_obra,
      r.ind_cant_rcd_generado_obra,
      r.ind_cant_rcd_aprovechado_obra,
      r.ind_cant_rcd_recibo_punto_limpio,
      r.ind_cant_rcd_recibo_planta_aprov,
      r.ind_cant_rcd_llevado_sitio_dispos_final,

      r.meta_mater_const_util_obra_fabri_de_rcd_tonelada,
      r.meta_mater_const_util_obra_fabri_de_rcd_porcentaje,
      r.meta_rcd_aprovechado_en_obra_tonelada,
      r.meta_rcd_aprovechado_en_obra_porcentaje,
      r.meta_rcd_entregado_planta_aprovechamiento_tonelada,
      r.meta_rcd_entregado_planta_aprovechamiento_porcentaje,
      r.meta_total_tonelada,
      r.meta_total_porcentaje,

      proyecto,
      proyectoNombre
    );
  }
}
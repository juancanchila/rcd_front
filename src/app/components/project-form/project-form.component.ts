import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ToastService } from '../../services/toast.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ArchivoService } from '../../services/archivo.service';
import { ProjectDataComponent } from '../project-data/project-data.component';
import { MapPickerComponent } from '../map-picker/map-picker.component';
import { GeneratorGeneralDocumentsComponent } from '../generator-general-documents/generator-general-documents.component';
import { BigOrSmallGeneratorDocuments } from '../bigorsmall-generator-documents/bigorsmal-documents.component';
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
  selector: 'project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    ProjectDataComponent,
    MapPickerComponent,
    MatExpansionModule
],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
})
export class ProjectFormComponent {
  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 4;

  vehicleForm!: FormGroup;
  proyecto!: FormGroup;
  vehicleDocumentsForm!: FormGroup;
  infoextra!: FormGroup;
   documentos!: FormGroup;

  transportadorId!: string | null;
  form: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
    private vehiculoSrv: VehiculoService,
    private archivoSrv: ArchivoService
  ) {
    this.transportadorId = this.route.snapshot.paramMap.get('id');

    // -------------------------------
    // 🟩 PROYECTO
    // -------------------------------
    this.proyecto = this.fb.group({
      tipo_de_generador: [''],
      localidad_proyecto: [''],
      barrio_proyecto: [''],
      direccion_del_proyecto: [''],
      latitud: [''],
      longitud: [''],
      fecha_inicio: [''],
      fecha_final: ['', ],
      nombre_del_proyecto: [''],
      datos_predios: this.fb.array([]),
      descripcion_del_proyecto_o_actividad_a_ejecutar: [''],
      area_a_intervenir_m2: [''],
      cantidad_de_rcd_a_generar_toneladas: [''],

      tipo_licencia_0100: this.fb.group({
        urbanizacion_block_0100: this.fb.group({
          desarrollo: [false],
          saneamiento: [false],
          reurbanizacion: [false],
        }),
        construccion_block_0100: this.fb.group({
          obra_nueva: [false],
          ampliacion: [false],
          adecuacion: [false],
          modificacion: [false],
          restauracion: [false],
          reforzamiento_estructural: [false],
          demolicion: [false],
          reconstruccion: [false],
          cerramiento: [false],
          otra_construccion: [false],
          otra_cual_construccion_0100: [''],
        }),
        bic_block_0100: this.fb.group({
          intervenciones_minimas: [false],
          primeros_auxilios: [false],
          reparaciones_locativas: [false],
        }),
        espacio_publico_block_0100: this.fb.group({
          instalaciones_redes: [false],
          andenes_parques: [false],
          otra_espacio_publico: [false],
          otra_cual_espacio_publico_0100: [''],
        }),
        planes_pot_0100: [''],
        demolicion_ruina_block_0100: this.fb.group({
          demolicion_respuesta_0100: [''],
        }),
        resolucion_numero_0100: [''],
      }),
    });

    // -------------------------------
    // 🟩 VEHÍCULO
    // -------------------------------
    this.vehicleForm = this.fb.group({
      tipo_solicitante: ['Persona Natural'],
      unidad_capacidad: ['kg'],
      capacidad_vehiculo: [''],
      clase_vehiculo: [''],
      placa_vehiculo: [
        '',
      ],
      marca: [''],
      modelo: [''],
      color: [''],
      numero_chasis: [''],
      numero_motor: [''],
    });

    // -------------------------------
    // 🟩 INFO EXTRA
    // -------------------------------
    this.infoextra = this.fb.group({
      fecha_expedicion_pin: [''],
      consecutivo_sigob: [''],
    });

    // -------------------------------
    // 🟩 DOCUMENTOS
    // -------------------------------
    this.vehicleDocumentsForm = this.fb.group({
      carta_solicitud: [''],
      descripcion_tecnica_proyecto: [''],
      certificado_tradicion_libertad: [''],
      autorizacion_bic: [''],
      registro_defuncion: [''],
      cuadro_cantidades_rcd:[''],
      soporte_pago_pin:[''],
      cronograma_actividades:[''],
      contrato_obra_otros:[''],
      programa_manejo_rcd_pdf:[''],
      autorizacion_bicBigOrSmall:[''],
      certificado_no_requiere_licencia:[''],
      permiso_ocupacion_cauce:[''],
      resolucion_curaduria_o_licencia:[''],
      planos_aprobados_curaduria:[''],
      foto_lateral_derecha: [''],
      foto_lateral_izquierda: [''],
      registro_herramientas: [''],
      certificado_leasing: [''],
      certificado_tecnicomecanica: [''],
 
      autoriza_propietario: [''],
    });

    // -------------------------------
    // 🟩 VALIDACIÓN DINÁMICA
    // -------------------------------
    this.vehicleForm.get('tipo_solicitante')?.valueChanges.subscribe((tipo) => {
      const identificacion = this.vehicleDocumentsForm.get('identificacion');
      const certExtLegal = this.vehicleDocumentsForm.get('cert_ext_legal');

      if (tipo === 'Persona Natural') {
        identificacion?.setValidators([Validators.required]);
        certExtLegal?.clearValidators();
        certExtLegal?.setValue('');
      } else if (tipo === 'Persona Jurídica') {
        certExtLegal?.setValidators([Validators.required]);
        identificacion?.clearValidators();
        identificacion?.setValue('');
      } else {
        identificacion?.clearValidators();
        certExtLegal?.clearValidators();
      }

      identificacion?.updateValueAndValidity();
      certExtLegal?.updateValueAndValidity();
    });
  }

  // -------------------------------
  // VALIDACIONES
  // -------------------------------
// project-form.component.ts
isInvalid(name: string, group: FormGroup) {
    const c = group.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
}

  isRequired(_: string) {
    return true;
  }

  // ts: project-form.component.ts (Dentro de ProjectFormComponent)

/**
 * Obtiene las opciones marcadas (true) de un bloque específico de licencia.
 * @param blockName El nombre del FormGroup anidado (ej: 'urbanizacion_block_0100').
 * @returns Array de strings con los nombres de las opciones marcadas.
 */
getLicenciaOptions(blockName: string): string[] {
  // Asegúrate de usar 'this.proyecto' o el FormGroup principal que contiene 'tipo_licencia_0100'
  const block = this.proyecto.get('tipo_licencia_0100')?.get(blockName);

  if (!block || !block.value) return [];
  
  const values = block.value;

  // Filtra las claves donde el valor sea true
  const selectedOptions = Object.keys(values).filter(key => values[key] === true);

  // Formatea el texto (ej: "obra_nueva" -> "Obra Nueva")
  return selectedOptions.map(key => {
    const formatted = key.replace(/_/g, ' ');
    // Si tienes otra_construccion, usa el valor de 'otra_cual_construccion_0100' si existe.
    if (key === 'otra_construccion') {
        const otraCual = this.proyecto.get('tipo_licencia_0100.construccion_block_0100.otra_cual_construccion_0100')?.value;
        return otraCual ? `Otra: ${otraCual}` : 'Otra (sin especificar)';
    }
    if (key === 'otra_espacio_publico') {
        const otraCual = this.proyecto.get('tipo_licencia_0100.espacio_publico_block_0100.otra_cual_espacio_publico_0100')?.value;
        return otraCual ? `OTRA: ${otraCual}` : 'OTRA (sin especificar)';
    }
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });
}

/**
 * Obtiene el valor de la pregunta de demolición (SI/NO).
 */
getDemolicionRespuesta(): string | null {
  return this.proyecto.get('tipo_licencia_0100.demolicion_ruina_block_0100.demolicion_respuesta_0100')?.value || null;
}

/**
 * Obtiene el número de resolución.
 */
getResolucionNumero(): string | null {
  return this.proyecto.get('tipo_licencia_0100.resolucion_numero_0100')?.value || null;
}

    // ============================================================
  // 🔹 MANEJO DE MAPA
  // ============================================================
  onMap(coords: { latitude: number; longitude: number }): void {
    this.form.patchValue({
      latitud: coords.latitude,
      longitud: coords.longitude,
    });
  }
  
  // -------------------------------
  // WIZARD
  // -------------------------------
  nextStep() {
    let g =
      this.step === 0
        ? this.vehicleForm
        : this.step === 1
        ? this.vehicleDocumentsForm
        : this.infoextra;

    if (g.invalid) {
      g.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios antes de continuar.');
      return;
    }

    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
  }

  // -------------------------------
  // CAPTURA DE ARCHIVOS
  // -------------------------------
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.vehicleDocumentsForm.get(controlName)?.setValue('');
      return;
    }
    this.vehicleDocumentsForm.get(controlName)?.setValue(input.files[0]);
  }
// project-form.component.ts

  getUploadedDocuments(): string[] {
    const docs = this.vehicleDocumentsForm.value;
    return Object.keys(docs)
      .filter((key) => docs[key])
      .map((key) => key.replace(/_/g, ' '));
  }

  addOneYear(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0]; // formato YYYY-MM-DD
  }

  private extractFilename(value: any): string {
    if (!value) return '';
    if (value instanceof File) return value.name;
    return value.toString().replace(/^C:\\fakepath\\/, ''); // elimina fakepath
  }

  private buildPayload() {
    const v = this.vehicleForm.value;
    const d = this.vehicleDocumentsForm.value;
    const i = this.infoextra.value;

    return {
      idvehiculo: 0,
      placaVehiculo: v.placa_vehiculo.toUpperCase(),
      lugarExpedicion: null,
      modelo: v.modelo,
      capacidad: `${v.capacidad_vehiculo} ${v.unidad_capacidad}`,
      fechaUltimaRevTecMec: null,
      permisoMovilizacion: null,
      nombreConductor: null,
      numeroIdentificacion: null,

      fotoFrente: this.extractFilename(d.foto_frontal),
      fotoLadoDerecho: this.extractFilename(d.foto_lateral_derecha),
      fotoLadoIzquierdo: this.extractFilename(d.foto_lateral_izquierda),
      fotoTrasera: this.extractFilename(d.foto_trasera),

      idtransportador: this.transportadorId || 0,
      licenciaTransito: this.extractFilename(d.licencia_transito),
      certificadoRevTecMec: this.extractFilename(d.certificado_tecnicomecanica),

      fechaExpedicionPIN: i.fecha_expedicion_pin,
      fechaVencimientoPIN: this.addOneYear(i.fecha_expedicion_pin),
      codigoRadicadoSIGOD: i.consecutivo_sigob,
    };
  }

  // -------------------------------
  // ENVÍO DEL FORMULARIO
  // -------------------------------
  async onSubmit(): Promise<void> {
    if (this.vehicleForm.invalid || this.vehicleDocumentsForm.invalid || this.infoextra.invalid) {
      this.vehicleForm.markAllAsTouched();
      this.vehicleDocumentsForm.markAllAsTouched();
      this.infoextra.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios.');
      return;
    }

    try {
      const payload = this.buildPayload();
      const vehiculoBaseResp: any = await this.vehiculoSrv.crearVehiculo(payload);
      const idVehiculo = vehiculoBaseResp.idvehiculo;

      const docs = this.vehicleDocumentsForm.value;
      const archivosRenombrados: any = {};

      for (const key of Object.keys(docs)) {
        const file = docs[key];
        if (!file || !(file instanceof File)) continue;

        const nuevoNombre = `${idVehiculo}_${key}_${file.name}`;
        const renamedFile = new File([file], nuevoNombre, { type: file.type });
        const uploadResp: any = await this.archivoSrv.subirArchivo(renamedFile);

        archivosRenombrados[key] = uploadResp?.filename || nuevoNombre;
      }

      const vehiculoUpdate = {
        ...payload,
        fotoFrente: archivosRenombrados['foto_frontal'] || null,
        fotoTrasera: archivosRenombrados['foto_trasera'] || null,
        fotoLadoDerecho: archivosRenombrados['foto_lateral_derecha'] || null,
        fotoLadoIzquierdo: archivosRenombrados['foto_lateral_izquierda'] || null,
        licenciaTransito: archivosRenombrados['licencia_transito'] || null,
        certificadoRevTecMec: archivosRenombrados['certificado_tecnicomecanica'] || null,
      };

      await this.vehiculoSrv.actualizarVehiculo(idVehiculo, vehiculoUpdate);

      this.saved.emit({ ...vehiculoUpdate });
      this.toast.showSuccess(
        'Vehículo creado correctamente',
        '/transportador-detalle/' + this.transportadorId
      );
    } catch (err) {
      console.error(err);
      this.toast.showError('Error al procesar el registro.');
    }
  }
}

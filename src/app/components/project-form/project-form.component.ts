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
      tipo_de_generador: ['', Validators.required],
      localidad_proyecto: ['', Validators.required],
      barrio_proyecto: [''],
      direccion_del_proyecto: ['', [Validators.required, Validators.minLength(10)]],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      fecha_inicio: [''],
      fecha_final: ['', Validators.required],
      nombre_del_proyecto: [''],
      datos_predios: this.fb.array([]),
      descripcion_del_proyecto_o_actividad_a_ejecutar: ['', Validators.required],
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
        planes_pot_0100: ['', Validators.required],
        demolicion_ruina_block_0100: this.fb.group({
          demolicion_respuesta_0100: ['', Validators.required],
        }),
        resolucion_numero_0100: ['', Validators.required],
      }),
    });

    // -------------------------------
    // 🟩 VEHÍCULO
    // -------------------------------
    this.vehicleForm = this.fb.group({
      tipo_solicitante: ['Persona Natural', Validators.required],
      unidad_capacidad: ['kg', Validators.required],
      capacidad_vehiculo: ['', [Validators.required, Validators.min(1)]],
      clase_vehiculo: ['', Validators.required],
      placa_vehiculo: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/)],
      ],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      color: [''],
      numero_chasis: [''],
      numero_motor: [''],
    });

    // -------------------------------
    // 🟩 INFO EXTRA
    // -------------------------------
    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['', Validators.required],
      consecutivo_sigob: ['', Validators.required],
    });

    // -------------------------------
    // 🟩 DOCUMENTOS
    // -------------------------------
    this.vehicleDocumentsForm = this.fb.group({
      identificacion: [''],
      cert_ext_legal: [''],
      licencia_transito: ['', Validators.required],
      foto_frontal: ['', Validators.required],
      foto_trasera: ['', Validators.required],
      foto_lateral_derecha: ['', Validators.required],
      foto_lateral_izquierda: ['', Validators.required],
      registro_herramientas: ['', Validators.required],
      certificado_leasing: [''],
      certificado_tecnicomecanica: ['', Validators.required],
      registro_defuncion: [''],
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
  isInvalid(name: string, group: FormGroup) {
    const c = group.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  isRequired(_: string) {
    return true;
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

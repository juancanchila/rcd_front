import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { VehicleDataComponent } from '../vehicle-data/vehicle-data.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ToastService } from '../../services/toast.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ArchivoService } from '../../services/archivo.service';

@Component({
  selector: 'vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    VehicleDataComponent,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css'],
})
export class VehicleFormComponent {
  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 4;

  vehicleForm!: FormGroup;
  vehicleDocumentsForm!: FormGroup;
  infoextra!: FormGroup;

  transportadorId!: string | null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
    private vehiculoSrv: VehiculoService,
    private archivoSrv: ArchivoService
  ) {
    this.transportadorId = this.route.snapshot.paramMap.get('id');

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

    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['', Validators.required],
      consecutivo_sigob: ['', Validators.required],
    });

    this.vehicleDocumentsForm = this.fb.group({
      identificacion: [''],
      cert_ext_legal: [''],
      licencia_transito: ['', Validators.required],
      foto_frontal: ['', Validators.required],
      foto_trasera: ['', Validators.required],
      foto_lateral_derecha: ['', Validators.required],
      foto_lateral_izquierda: ['', Validators.required],
      registro_herramientas: [''],
      certificado_leasing: [''],
      certificado_tecnicomecanica: ['', Validators.required],
      registro_defuncion: [''],
      autoriza_propietario: [''],
    });

    // VALIDACIÓN DINÁMICA
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

  // VALIDACIONES
  isInvalid(name: string, group: FormGroup) {
    const c = group.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  isRequired(_: string) {
    return true;
  }

  // WIZARD
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

  // CAPTURA DE ARCHIVOS
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
    return value.toString().replace(/^C:\\fakepath\\/, ''); // elimina fakepath si queda
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
  // ENVÍO DEL FORMULARIO
  async onSubmit(): Promise<void> {
    // Validaciones
    if (this.vehicleForm.invalid || this.vehicleDocumentsForm.invalid || this.infoextra.invalid) {
      this.vehicleForm.markAllAsTouched();
      this.vehicleDocumentsForm.markAllAsTouched();
      this.infoextra.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios.');
      return;
    }

    try {
      // 1️⃣ CREAR VEHÍCULO BASE
      const payload = this.buildPayload();
      const vehiculoBaseResp: any = await this.vehiculoSrv.crearVehiculo(payload);
      const idVehiculo = vehiculoBaseResp.idvehiculo;

      // 2️⃣ SUBIR DOCUMENTOS CON NOMBRE RENOMBRADO
      const docs = this.vehicleDocumentsForm.value;
      const archivosRenombrados: any = {};

      for (const key of Object.keys(docs)) {
        const file = docs[key];
        if (!file || !(file instanceof File)) continue;

        // RENOMBRAR ARCHIVO
        const nuevoNombre = `${idVehiculo}_${key}_${file.name}`;
        const renamedFile = new File([file], nuevoNombre, { type: file.type });

        // SUBIR ARCHIVO
        const uploadResp: any = await this.archivoSrv.subirArchivo(renamedFile);

        // GUARDAR NOMBRE FINAL
        archivosRenombrados[key] = uploadResp?.filename || nuevoNombre;
      }

      // 3️⃣ ACTUALIZAR VEHÍCULO CON NOMBRES FINALES
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

      // 4️⃣ EMITIR EVENTO Y MENSAJE
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

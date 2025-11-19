import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { VehicleDataComponent } from '../vehicle-data/vehicle-data.component';
import { VehicleDocumentsComponent } from '../vehicle-documents/vehicle-documents.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastService } from '../../services/toast.service';

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
    VehicleDocumentsComponent,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css'],
})
export class VehicleFormComponent {
  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 3;

  vehicleForm!: FormGroup;
  vehicleDocumentsForm!: FormGroup;

  transportadorId!: string | null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private toast: ToastService) {
    this.transportadorId = this.route.snapshot.paramMap.get('id');

    // FORM VEHÍCULO
    this.vehicleForm = this.fb.group({
      tipo_solicitante: ['Persona Natural', Validators.required], // <-- NUEVO
      unidad_capacidad: ['kg', Validators.required],
      capacidad_vehiculo: ['', [Validators.required, Validators.min(1)]],
      clase_vehiculo: ['', Validators.required],
      placa_vehiculo: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
    });

    // FORM DOCUMENTOS VEHÍCULO
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

    // 🔹 Suscripción al cambio de tipo de solicitante para validar documentos
    this.vehicleForm.get('tipo_solicitante')?.valueChanges.subscribe(tipo => {
      const identificacion = this.vehicleDocumentsForm.get('identificacion');
      const certExtLegal = this.vehicleDocumentsForm.get('cert_ext_legal');

      if (tipo === 'Persona Natural') {
        identificacion?.setValidators([Validators.required]);
        certExtLegal?.clearValidators();
      } else if (tipo === 'Persona Jurídica') {
        certExtLegal?.setValidators([Validators.required]);
        identificacion?.clearValidators();
      }

      identificacion?.updateValueAndValidity();
      certExtLegal?.updateValueAndValidity();
    });
  }

  // CAMBIO DE PASOS CON VALIDACIÓN
  nextStep() {
    let currentGroup: FormGroup;

    if (this.step === 0) currentGroup = this.vehicleForm;
    else if (this.step === 1) currentGroup = this.vehicleDocumentsForm;
    else currentGroup = this.vehicleForm; // fallback

    if (currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios antes de continuar.');
      return;
    }

    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
  }

  // DOCUMENTOS CARGADOS
  getUploadedDocuments(): string[] {
    const docs = this.vehicleDocumentsForm.value;
    return Object.keys(docs)
      .filter(key => docs[key])
      .map(key => key.replace(/_/g, ' '));
  }

  // SUBMIT FINAL
  onSubmit(): void {
    if (this.vehicleForm.invalid || this.vehicleDocumentsForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      this.vehicleDocumentsForm.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios antes de guardar.');
      return;
    }

    const finalData = {
      transportadorId: this.transportadorId,
      vehiculo: this.vehicleForm.value,
      documentos: this.vehicleDocumentsForm.value,
    };

    this.toast.showSuccess(
      'Vehículo guardado correctamente',
      '/transportador-detalle/' + this.transportadorId
    );

    this.saved.emit(finalData);
  }
}

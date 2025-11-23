// src/app/components/visita-tecnica-form/visita-tecnica-form.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { ToastService } from '../../services/toast.service';
import { VisitaTecnicaService } from '../../services/visitatecnica.service';
import { ArchivoService } from '../../services/archivo.service';

@Component({
  selector: 'visita-tecnica-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './visita-tecnica-form.component.html',
  styleUrls: ['./visita-tecnica-form.component.css'],
})
export class VisitaTecnicaFormComponent {
  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 3;

  visitaForm!: FormGroup;
  documentosForm!: FormGroup;

  idProyecto!: string | null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
    private visitaSrv: VisitaTecnicaService,
    private archivoSrv: ArchivoService
  ) {
    this.idProyecto = this.route.snapshot.paramMap.get('id');

    this.visitaForm = this.fb.group({
      fechaCreacion: [new Date().toISOString().split('T')[0], Validators.required],
      estado: ['Pendiente', Validators.required],
      fechaVisita: ['', Validators.required],
      estadoProyecto: ['No reportado', Validators.required],
      observaciones: [''],
      idTecnico: [null],
    });

    this.documentosForm = this.fb.group({
      actaFile: ['', Validators.required]
    });
  }

  // Validaciones
  isInvalid(name: string, group: FormGroup) {
    const c = group.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  nextStep() {
    const g = this.step === 0 ? this.visitaForm : this.documentosForm;
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

  // Selección de archivo
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.documentosForm.get(controlName)?.setValue('');
      return;
    }
    this.documentosForm.get(controlName)?.setValue(input.files[0]);
  }

  private extractFilename(value: any): string {
    if (!value) return '';
    if (value instanceof File) return value.name;
    return value.toString().replace(/^C:\\fakepath\\/, '');
  }

  private buildPayload(): any {
    const v = this.visitaForm.value;
    const d = this.documentosForm.value;
    return {
      idvisitatecnica: 0,
      fechaCreacion: v.fechaCreacion,
      estado: v.estado,
      fechaVisita: v.fechaVisita,
      idTecnico: v.idTecnico,
      estadoProyecto: v.estadoProyecto,
      observaciones: v.observaciones || null,
      idProyecto: this.idProyecto ? Number(this.idProyecto) : 0,
      acta: this.extractFilename(d.actaFile)
    };
  }

  getUploadedDocuments(): string[] {
    const docs = this.documentosForm.value;
    return Object.keys(docs)
      .filter(key => docs[key])
      .map(key => key.replace(/_/g, ' '));
  }

  // ENVÍO DEL FORMULARIO CON RENOMBRADO Y SUBIDA DE ARCHIVO
  async onSubmit(): Promise<void> {
    if (this.visitaForm.invalid || this.documentosForm.invalid) {
      this.visitaForm.markAllAsTouched();
      this.documentosForm.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios.');
      return;
    }

    try {
      // 1️⃣ CREAR VISITA TÉCNICA BASE
      const payload = this.buildPayload();
      const visitaCreada: any = await this.visitaSrv.crearVisitaTecnica(payload);
      const idVisita = visitaCreada.data?.idvisitatecnica;

      // 2️⃣ SUBIR ACTA CON NOMBRE RENOMBRADO
      const actaFile: File = this.documentosForm.get('actaFile')?.value;
      let archivoRenombrado: string | null = null;

      if (actaFile) {
        const nuevoNombre = `${idVisita}_acta_${actaFile.name}`;
        const renamedFile = new File([actaFile], nuevoNombre, { type: actaFile.type });

        const uploadResp: any = await this.archivoSrv.subirArchivo(renamedFile);
        archivoRenombrado = uploadResp?.filename || nuevoNombre;
      }

      // 3️⃣ ACTUALIZAR VISITA CON NOMBRE FINAL DEL ARCHIVO
      const visitaUpdate = {
        ...visitaCreada,
        acta: archivoRenombrado
      };
      await this.visitaSrv.actualizarVisitaTecnica(idVisita, visitaUpdate);

      // 4️⃣ EMITIR EVENTO Y MENSAJE
      this.saved.emit(visitaUpdate);
      this.toast.showSuccess('Visita técnica creada correctamente', `/proyecto-detalle/${this.idProyecto}`);
      this.step = this.totalSteps - 1; // Ir al resumen
    } catch (err) {
      console.error(err);
      this.toast.showError('Error al procesar la visita técnica.');
    }
  }
}

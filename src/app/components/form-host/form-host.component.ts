import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ContactDataComponent } from '../contact-data/contact-data.component';
import { ProjectDataComponent } from '../project-data/project-data.component';
import { MapPickerComponent } from '../map-picker/map-picker.component';
import { GestorDataComponent } from '../gestor-data/gestor-data.component';
import { VehicleDataComponent } from '../vehicle-data/vehicle-data.component';
import { VehicleDocumentsComponent } from '../vehicle-documents/vehicle-documents.component';
import { SummaryDataComponent } from '../summary-data/summary-data.component';
@Component({
  selector: 'form-host',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressBarModule,
    ContactDataComponent,
    ProjectDataComponent,
    MapPickerComponent,
    GestorDataComponent,
    VehicleDataComponent,
    VehicleDocumentsComponent,
    SummaryDataComponent,
  ],
  templateUrl: './form-host.component.html',
  styleUrls: ['./form-host.component.scss'],
})
export class FormHostComponent {
  @Input() tipo?: string;
  @Output() saved = new EventEmitter<any>();

  form!: FormGroup;
  contacto!: FormGroup;
  proyecto!: FormGroup;
  gestor!: FormGroup;
  vehiculo!: FormGroup;
  vehiculodocuments!: FormGroup;

  step = 0;
  totalSteps = 4; // 🔹 contacto, proyecto, gestor, vehículo, mapa

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  private buildForm(): void {
    // 🔹 CONTACTO
    this.contacto = this.fb.group({
      tipo_de_solicitante: ['', Validators.required],
      nombre_de_representante_legal_: [''],
      ndeg_de_documento_de_representante_legal_: [''],
      razon_social: [''],
      nit: [''],
      nombres_y_apellidos: [''],
      documento_de_identidad: [''],
      correo_electronico: ['', [Validators.required, Validators.email]],
      telefono_movil: ['', Validators.required],
      telefono_fijo: [''], // opcional
      localidad: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion_de_correspondencia_del_solicitante: ['', Validators.required],
    });

    // 🔹 Validaciones dinámicas según tipo de solicitante
    this.contacto.get('tipo_de_solicitante')?.valueChanges.subscribe((tipo) => {
      const razonSocial = this.contacto.get('razon_social');
      const nit = this.contacto.get('nit');
      const nombres = this.contacto.get('nombres_y_apellidos');
      const documento = this.contacto.get('documento_de_identidad');

      if (tipo === 'Persona Jurídica') {
        razonSocial?.setValidators([Validators.required]);
        nit?.setValidators([Validators.required]);
        nombres?.clearValidators();
        documento?.clearValidators();
      } else if (tipo === 'Persona Natural') {
        nombres?.setValidators([Validators.required]);
        documento?.setValidators([Validators.required]);
        razonSocial?.clearValidators();
        nit?.clearValidators();
      } else {
        // Ninguno seleccionado → limpiar todos
        razonSocial?.clearValidators();
        nit?.clearValidators();
        nombres?.clearValidators();
        documento?.clearValidators();
      }

      // Actualizar estado
      razonSocial?.updateValueAndValidity();
      nit?.updateValueAndValidity();
      nombres?.updateValueAndValidity();
      documento?.updateValueAndValidity();
    });

    // 🔹 PROYECTO
    this.proyecto = this.fb.group({
      projectTitle: [''],
      projectClient: [''],
      projectDescription: [''],
    });

    // 🔹 GESTOR
    this.gestor = this.fb.group({
      volumen: [''],
      tipoProceso: [''],
    });

    // 🔹 VEHÍCULO
    this.vehiculo = this.fb.group({
      unidad_capacidad: ['kg', Validators.required],
      capacidad_vehiculo: ['', [Validators.required, Validators.min(1)]],
      clase_vehiculo: ['', Validators.required],
      placa_vehiculo: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/), // Placas tipo ABC123 o AB1234
        ],
      ],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
    });

    this.vehiculodocuments = this.fb.group({
      identificacion: ['', Validators.required],
      cert_ext_legal: ['', Validators.required],
      licencia_transito: ['', Validators.required],
      foto_frontal: ['', Validators.required],
      foto_trasera: ['', Validators.required],
      foto_lateral_derecha: ['', Validators.required],
      foto_lateral_izquierda: ['', Validators.required],
      registro_herramientas: ['', Validators.required],
      certificado_leasing: ['', Validators.required],
      certificado_tecnicomecanica: ['', Validators.required],
      registro_defuncion: [''], // opcional
      autoriza_propietario: [''], // opcional
    });

    // 🔹 FORMULARIO PRINCIPAL
    this.form = this.fb.group({
      contacto: this.contacto,
      proyecto: this.proyecto,
      gestor: this.gestor,
      vehiculo: this.vehiculo,
      vehiculodocuments: this.vehiculodocuments,
      latitud: [''],
      longitud: [''],
    });
  }

  onMap(coords: { latitude: number; longitude: number }): void {
    this.form.patchValue({
      latitud: coords.latitude,
      longitud: coords.longitude,
    });
  }
  private getCurrentGroupForStep(stepIndex: number): FormGroup | null {
    switch (stepIndex) {
      case 0:
        return this.contacto;
      case 1:
        // en el paso 1 muestras distintos subformularios según el tipo
        if (this.tipo === 'gestor') return this.gestor;
        if (this.tipo === 'proyecto') return this.proyecto;
        if (this.tipo === 'vehiculo' || this.tipo === 'transportador') return this.vehiculo;
        // si el step 1 es mapa (cuando tipo no es vehiculo/transportador), no hay grupo que validar
        return null;
      case 2:
        // paso 2 es documentos (cuando aplica)
        return this.vehiculodocuments;
      default:
        return this.form;
    }
  }

  nextStep(): void {
    // obtiene el FormGroup actual según el step y el tipo
    const currentGroup = this.getCurrentGroupForStep(this.step);

    if (currentGroup && currentGroup.invalid) {
      // marca todo como touched para que aparezcan los mat-error
      currentGroup.markAllAsTouched();
      // aviso simple — puedes cambiar por MatSnackBar si quieres algo más fino
      alert('⚠️ Debes completar correctamente los campos obligatorios antes de continuar.');
      return; // no avanzar
    }

    if (this.step < this.totalSteps - 1) {
      this.step++;
    }
  }

  prevStep(): void {
    if (this.step > 0) this.step--;
  }

onSubmit(): void {
  if (this.form.valid) {
    const contacto = this.form.get('contacto')?.value;
    const vehiculo = this.form.get('vehiculo')?.value;
    const vehiculodocuments = this.form.get('vehiculodocuments')?.value;
    const coords = {
      latitud: this.form.get('latitud')?.value,
      longitud: this.form.get('longitud')?.value,
    };

    // Construcción del resumen de contacto
    let resumenContacto: any = {
      tipo_de_solicitante: contacto.tipo_de_solicitante,
      correo_electronico: contacto.correo_electronico,
      telefono_movil: contacto.telefono_movil,
      telefono_fijo: contacto.telefono_fijo || '—',
      direccion: contacto.direccion_de_correspondencia_del_solicitante,
      localidad: contacto.localidad,
      barrio: contacto.barrio,
    };

    if (contacto.tipo_de_solicitante === 'Persona Jurídica') {
      resumenContacto = {
        ...resumenContacto,
        razon_social: contacto.razon_social,
        nit: contacto.nit,
        representante_legal: contacto.nombre_de_representante_legal_ || '—',
      };
    } else if (contacto.tipo_de_solicitante === 'Persona Natural') {
      resumenContacto = {
        ...resumenContacto,
        nombres_y_apellidos: contacto.nombres_y_apellidos,
        documento_de_identidad: contacto.documento_de_identidad,
      };
    }

    // Construcción del resumen del vehículo
    const resumenVehiculo = {
      clase: vehiculo.clase_vehiculo,
      placa: vehiculo.placa_vehiculo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      capacidad: `${vehiculo.capacidad_vehiculo} ${vehiculo.unidad_capacidad}`,
    };

    // Documentos cargados
    const docsSubidos = Object.entries(vehiculodocuments)
      .filter(([_, valor]) => !!valor)
      .map(([nombre]) => nombre);

    // 🔹 Resumen completo
    const resumenFinal = {
      contacto: resumenContacto,
      vehiculo: resumenVehiculo,
      documentos_cargados: docsSubidos,
      ubicacion: coords,
    };

    console.clear();
    console.log('✅ RESUMEN FINAL DE LA SOLICITUD:');
    console.table(resumenFinal.contacto);
    console.table(resumenFinal.vehiculo);
    console.log('📎 Documentos cargados:', docsSubidos);
    console.log('📍 Ubicación:', coords);

    // 🔸 Emitir el formulario completo (si deseas guardarlo también)
    this.saved.emit(this.form.value);

    alert('✅ Formulario válido. Datos mostrados en la consola.');
  } else {
    this.form.markAllAsTouched();
    alert('⚠️ Debes completar correctamente los campos obligatorios antes de guardar.');
  }
}

  onReset(): void {
    this.form.reset();
    this.step = 0;
  }
}

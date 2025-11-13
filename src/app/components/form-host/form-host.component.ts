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
import { PersonalDocuments } from '../personal-documents/personal-documents.component';
import { GeneratorGeneralDocumentsComponent } from '../generator-general-documents/generator-general-documents.component';
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
    GeneratorGeneralDocumentsComponent,
    VehicleDataComponent,
    VehicleDocumentsComponent,
    SummaryDataComponent,
    PersonalDocuments,
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
  personaldocuments!: FormGroup;
  generaldocuments!: FormGroup;

  step = 0;
  totalSteps = 4; // contacto, proyecto, gestor, vehículo, mapa

  constructor(private fb: FormBuilder) {
    this.buildForm();
  }

  // ============================================================
  // 🔹 CONSTRUCCIÓN DE FORMULARIOS
  // ============================================================
  private buildForm(): void {
    this.generaldocuments = this.fb.group({
      cert_ext_rep_legal: ['', Validators.required],
      certificado_tradicion_libertad: ['', Validators.required],
      contrato_obra_y_otros: [''],
      copia_resolucion_curaduria_licencias: ['', Validators.required],
      nota_no_requiere_licencia_planeacion: [''],
      autorizacion_intervencion_bic: [''],
      programa_manejo_rcd_pdf: ['', Validators.required],
      carta_de_solicitud: ['', Validators.required],
    });

    // -------------------------------
    // 🟩 CONTACTO
    // -------------------------------
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
      telefono_fijo: [''],
      localidad: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion_de_correspondencia_del_solicitante: ['', Validators.required],
    });
    // 🔸 Validaciones dinámicas según tipo de solicitante
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
        razonSocial?.clearValidators();
        nit?.clearValidators();
        nombres?.clearValidators();
        documento?.clearValidators();
      }

      razonSocial?.updateValueAndValidity();
      nit?.updateValueAndValidity();
      nombres?.updateValueAndValidity();
      documento?.updateValueAndValidity();
    });

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

    // 🔸 Validaciones dinámicas según tipo de generador
    this.proyecto.get('tipo_de_generador')?.valueChanges.subscribe((tipo) => {
      const tipoLicencia = this.proyecto.get('tipo_licencia_0100');
      const planes = tipoLicencia?.get('planes_pot_0100');
      const demol = tipoLicencia?.get('demolicion_ruina_block_0100.demolicion_respuesta_0100');
      const resol = tipoLicencia?.get('resolucion_numero_0100');

      if (tipo !== 'PEQUEÑO GENERADOR QUE NO REQUIERE LICENCIA O PERMISO.') {
        planes?.setValidators([Validators.required]);
        demol?.setValidators([Validators.required]);
        resol?.setValidators([Validators.required]);
      } else {
        planes?.clearValidators();
        demol?.clearValidators();
        resol?.clearValidators();
      }

      planes?.updateValueAndValidity();
      demol?.updateValueAndValidity();
      resol?.updateValueAndValidity();
    });

    // -------------------------------
    // 🟩 GESTOR
    // -------------------------------
    this.gestor = this.fb.group({
      volumen: [''],
      tipoProceso: [''],
    });

    // -------------------------------
    // 🟩 VEHÍCULO
    // -------------------------------
    this.vehiculo = this.fb.group({
      unidad_capacidad: ['kg', Validators.required],
      capacidad_vehiculo: ['', [Validators.required, Validators.min(1)]],
      clase_vehiculo: ['', Validators.required],
      placa_vehiculo: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/)],
      ],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
    });

    // -------------------------------
    // 🟩 DOCUMENTOS DEL VEHÍCULO
    // -------------------------------
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
      registro_defuncion: [''],
      autoriza_propietario: [''],
    });

    // -------------------------------
    // 🟩 DOCUMENTOS PERSONALES
    // -------------------------------
    this.personaldocuments = this.fb.group({
      identificacion: ['', Validators.required],
      certificado_existencia_representacion_legal: ['', Validators.required],
    });

    // -------------------------------
    // 🟩 FORMULARIO PRINCIPAL
    // -------------------------------
    this.form = this.fb.group({
      contacto: this.contacto,
      proyecto: this.proyecto,
      gestor: this.gestor,
      vehiculo: this.vehiculo,
      vehiculodocuments: this.vehiculodocuments,
      personaldocuments: this.personaldocuments,
      generaldocuments: this.generaldocuments,
      latitud: [''],
      longitud: [''],
    });
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

  // ============================================================
  // 🔹 NAVEGACIÓN ENTRE PASOS
  // ============================================================
  private getCurrentGroupForStep(stepIndex: number): FormGroup | null {
    switch (stepIndex) {
      case 0:
        return this.contacto;
      case 1:
        if (this.tipo === 'gestor') return this.gestor;
        if (this.tipo === 'proyecto') return this.proyecto;
        if (this.tipo === 'vehiculo' || this.tipo === 'transportador') return this.vehiculo;
        return null;
      case 2:
        return this.vehiculodocuments;
      default:
        return this.form;
    }
  }

  nextStep(): void {
    const currentGroup = this.getCurrentGroupForStep(this.step);
    if (currentGroup && currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      alert('⚠️ Debes completar correctamente los campos obligatorios antes de continuar.');
      return;
    }
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep(): void {
    if (this.step > 0) this.step--;
  }

  // ============================================================
  // 🔹 ENVÍO Y RESET DEL FORMULARIO
  // ============================================================
  onSubmit(): void {
    if (this.form.valid) {
      const contacto = this.form.get('contacto')?.value;
      const vehiculo = this.form.get('vehiculo')?.value;
      const vehiculodocuments = this.form.get('vehiculodocuments')?.value;
      const coords = {
        latitud: this.form.get('latitud')?.value,
        longitud: this.form.get('longitud')?.value,
      };

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

      const resumenVehiculo = {
        clase: vehiculo.clase_vehiculo,
        placa: vehiculo.placa_vehiculo,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        capacidad: `${vehiculo.capacidad_vehiculo} ${vehiculo.unidad_capacidad}`,
      };

      const docsSubidos = Object.entries(vehiculodocuments)
        .filter(([_, valor]) => !!valor)
        .map(([nombre]) => nombre);

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

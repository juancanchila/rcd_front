import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
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

import { MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { ProyectoService } from '../../services/proyecto.service';



@Component({
  selector: 'project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
      MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    ProjectDataComponent,
    MapPickerComponent,

    MatExpansionModule,
   

    MatExpansionModule

],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
})
export class ProjectFormComponent {
  @Output() saved = new EventEmitter<any>();
public today: string = '';
  step = 0;
  totalSteps = 4;

  vehicleForm!: FormGroup;
  proyecto!: FormGroup;
  vehicleDocumentsForm!: FormGroup;
  infoextra!: FormGroup;
   documentos!: FormGroup;

  generadorId!: string | null;
  form!: FormGroup;
minDate: string;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
    private ProyectoServ: ProyectoService,
    private archivoSrv: ArchivoService
  ) {
     this.minDate = new Date().toISOString().split('T')[0];
  
    this.generadorId = this.route.snapshot.paramMap.get('id');
    console.log(this.generadorId,'transport');

    // -------------------------------
    // 🟩 PROYECTO
    // -------------------------------
    this.proyecto = this.fb.group({
 tipo_de_generador: ['', Validators.required],
    localidad_proyecto: ['', Validators.required],
    barrio_proyecto: ['', Validators.required],
    direccion_del_proyecto: ['', Validators.required],

    latitud: ['', Validators.required],
    longitud: ['', Validators.required],

    fecha_inicio: ['',Validators.required],
    fecha_final: ['', Validators.required],

    nombre_del_proyecto: ['', Validators.required],

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
        planes_pot_0100: [''],
        demolicion_ruina_block_0100: this.fb.group({
          demolicion_respuesta_0100: [''],
        }),
        resolucion_numero_0100: [''],
      }),
    },
   {
    validators: (form) => {
      const inicio = form.get('fecha_inicio')?.value;
      const final = form.get('fecha_final')?.value;

      if (!inicio || !final) return null;

      const fechaInicio = new Date(inicio);
      const fechaFinal = new Date(final);

      return fechaInicio <= fechaFinal ? null : { fechaInvalida: true };
    },
  }
);

   this.form = this.fb.group({
    proyecto: this.proyecto,
      vehicleDocumentsForm:this.vehicleDocumentsForm,      
      infoextra: this.infoextra,
    });

   


    // -------------------------------
    // 🟩 INFO EXTRA
    // -------------------------------
    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['',Validators.required],
      consecutivo_sigob: ['',Validators.required],
    });

 this.proyecto.addControl('latitud', this.fb.control(null));
    this.proyecto.addControl('longitud', this.fb.control(null));

    

    // -------------------------------
    // 🟩 DOCUMENTOS
    // -------------------------------
    this.vehicleDocumentsForm = this.fb.group({

carta_solicitud: ['', Validators.required],
  descripcion_tecnica_proyecto: ['', Validators.required],
  certificado_tradicion_libertad: ['', Validators.required],
  autorizacion_bic: ['', Validators.required],
  registro_defuncion: ['', Validators.required],
  cuadro_cantidades_rcd: [''],
  soporte_pago_pin: [''],
  cronograma_actividades: [''],
  contrato_obra_otros: [''],
  programa_manejo_rcd_pdf: [''],
  autorizacion_bicBigOrSmall: [''],
      certificado_no_requiere_licencia:[''],
      permiso_ocupacion_cauce:[''],
      resolucion_curaduria_o_licencia:[''],
      planos_aprobados_curaduria:[''], 
    });

    // -------------------------------
    // 🟩 VALIDACIÓN DINÁMICA
    // -------------------------------

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


//fecha
// ts: project-form.component.ts (Dentro de ProjectFormComponent)

getTodayDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ts: project-form.component.ts (Dentro de ProjectFormComponent)

/**
 * Validador personalizado para asegurar que Fecha Final <= Fecha Inicial.
 */
// ts: ProjectFormComponent.ts (Dentro de la clase)

// ts: ProjectFormComponent.component.ts (Dentro de la clase)

// ts: ProjectFormComponent.ts (Dentro de la clase)


    // ============================================================
  // 🔹 MANEJO DE MAPA
  // ============================================================
  onMap(coords: { latitude: number; longitude: number }): void {
    this.proyecto.patchValue({
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
        ? this.proyecto
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

   buildPayload() { 
        const v = this.proyecto.value;
    const d = this.vehicleDocumentsForm.value;
    const i = this.infoextra.value;

    return {
     // -----------------------------
    // 📌 Información general del proyecto
    // -----------------------------
    idgenerador: this.generadorId,
    tipo_de_generador: v.tipo_de_generador,
    localidad_proyecto: v.localidad_proyecto,
    barrio_proyecto: v.barrio_proyecto,
    direccion_del_proyecto: v.direccion_del_proyecto,

    latitud: v.latitud,
    longitud: v.longitud,

    fecha_inicio: v.fecha_inicio,
    fecha_final: v.fecha_final,

    nombre_del_proyecto: v.nombre_del_proyecto,

    descripcion_del_proyecto_o_actividad_a_ejecutar:
      v.descripcion_del_proyecto_o_actividad_a_ejecutar,

    area_a_intervenir_m2: v.area_a_intervenir_m2,
    cantidad_de_rcd_a_generar_toneladas:
      v.cantidad_de_rcd_a_generar_toneladas,

    // -----------------------------
    // 📌 Datos de predios (array)
    // -----------------------------
    datos_predios: v.datos_predios?.map((predio: any) => ({
      ...predio,
    })),

    // -----------------------------
    // 📌 Tipo de licencia 0100
    // -----------------------------
    tipo_licencia_0100: {
      urbanizacion_block_0100: {
        desarrollo: v.tipo_licencia_0100.urbanizacion_block_0100.desarrollo,
        saneamiento: v.tipo_licencia_0100.urbanizacion_block_0100.saneamiento,
        reurbanizacion: v.tipo_licencia_0100.urbanizacion_block_0100.reurbanizacion,
      },

      construccion_block_0100: {
        obra_nueva: v.tipo_licencia_0100.construccion_block_0100.obra_nueva,
        ampliacion: v.tipo_licencia_0100.construccion_block_0100.ampliacion,
        adecuacion: v.tipo_licencia_0100.construccion_block_0100.adecuacion,
        modificacion: v.tipo_licencia_0100.construccion_block_0100.modificacion,
        restauracion: v.tipo_licencia_0100.construccion_block_0100.restauracion,
        reforzamiento_estructural:
          v.tipo_licencia_0100.construccion_block_0100.reforzamiento_estructural,
        demolicion: v.tipo_licencia_0100.construccion_block_0100.demolicion,
        reconstruccion: v.tipo_licencia_0100.construccion_block_0100.reconstruccion,
        cerramiento: v.tipo_licencia_0100.construccion_block_0100.cerramiento,
        otra_construccion: v.tipo_licencia_0100.construccion_block_0100.otra_construccion,
        otra_cual_construccion_0100:
          v.tipo_licencia_0100.construccion_block_0100.otra_cual_construccion_0100,
      },

      bic_block_0100: {
        intervenciones_minimas:
          v.tipo_licencia_0100.bic_block_0100.intervenciones_minimas,
        primeros_auxilios:
          v.tipo_licencia_0100.bic_block_0100.primeros_auxilios,
        reparaciones_locativas:
          v.tipo_licencia_0100.bic_block_0100.reparaciones_locativas,
      },

      espacio_publico_block_0100: {
        instalaciones_redes:
          v.tipo_licencia_0100.espacio_publico_block_0100.instalaciones_redes,
        andenes_parques:
          v.tipo_licencia_0100.espacio_publico_block_0100.andenes_parques,
        otra_espacio_publico:
          v.tipo_licencia_0100.espacio_publico_block_0100.otra_espacio_publico,
        otra_cual_espacio_publico_0100:
          v.tipo_licencia_0100.espacio_publico_block_0100
            .otra_cual_espacio_publico_0100,
      },

      planes_pot_0100: v.tipo_licencia_0100.planes_pot_0100,

      demolicion_ruina_block_0100: {
        demolicion_respuesta_0100:
          v.tipo_licencia_0100.demolicion_ruina_block_0100
            .demolicion_respuesta_0100,
      },

      resolucion_numero_0100:
        v.tipo_licencia_0100.resolucion_numero_0100,
    },

    // -----------------------------
    // 📌 Documentos vehiculares
    // -----------------------------

    

    // -----------------------------
    // 📌 Información extra
    // -----------------------------

    fecha_expedicion_pin: i.fecha_expedicion_pin,
    fecha_vencimiento_pin: this.addOneYear(i.fecha_expedicion_pin),
    consecutivo_sigob: i.consecutivo_sigob,
    };
  }

  // -------------------------------
  // ENVÍO DEL FORMULARIO
  // -------------------------------
  async onSubmit(): Promise<void> {
    console.log(this.proyecto,'proye',this.vehicleDocumentsForm,'doc',this.infoextra,'infoex')
    if (this.proyecto.invalid || this.vehicleDocumentsForm.invalid || this.infoextra.invalid) {
      this.proyecto.markAllAsTouched();
      this.vehicleDocumentsForm.markAllAsTouched();
      this.infoextra.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios.');
      return;
    }

    try {
     // 1️⃣ CREAR VEHÍCULO BASE
      const payload = this.buildPayload();
      const ProyecroBaseResp: any = await this.ProyectoServ.crearProyecto(payload);
      const idProyecto = ProyecroBaseResp.idProyecto;

      // 2️⃣ SUBIR DOCUMENTOS CON NOMBRE RENOMBRADO
      const docs = this.vehicleDocumentsForm.value;
      const archivosRenombrados: any = {};

      for (const key of Object.keys(docs)) {
        const file = docs[key];
        if (!file || !(file instanceof File)) continue;

        // RENOMBRAR ARCHIVO
        const nuevoNombre = `${idProyecto}_${key}_${file.name}`;
        const renamedFile = new File([file], nuevoNombre, { type: file.type });

        // SUBIR ARCHIVO
        const uploadResp: any = await this.archivoSrv.subirArchivo(renamedFile);

        // GUARDAR NOMBRE FINAL
        archivosRenombrados[key] = uploadResp?.filename || nuevoNombre;
      }

      // 3️⃣ ACTUALIZAR VEHÍCULO CON NOMBRES FINALES
      const proyectoUpdate = {
        ...payload,
        carta_solicitud: archivosRenombrados['carta_solicitud'] || null,
        descripcion_tecnica_proyecto: archivosRenombrados['descripcion_tecnica_proyecto'] || null,
        certificado_tradicion_libertad: archivosRenombrados['certificado_tradicion_libertad'] || null,
        autorizacion_bic: archivosRenombrados['autorizacion_bic'] || null,
        licenciaTransito: archivosRenombrados['registro_defuncion'] || null,
        
      };

      await this.ProyectoServ.actualizarProyecto(idProyecto, proyectoUpdate);

      // 4️⃣ EMITIR EVENTO Y MENSAJE
      this.saved.emit({ ...proyectoUpdate });
      this.toast.showSuccess(
        'Vehículo creado correctamente',
        '/proyecto-detalle/' + this.generadorId
      );
    } catch (err) {
      console.error(err);
      this.toast.showError('Error al procesar el registro.');
    }
  }
}

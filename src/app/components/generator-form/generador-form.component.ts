import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
import { Generador } from '../../models/generador.model';
import { GeneradorService } from '../../services/generador.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { catchError, combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';



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
  MatAutocompleteModule,
    MatExpansionModule,
   

    MatExpansionModule

],
  templateUrl: './generador-form.component.html',
  styleUrls: ['./generador-form.component.css'],
})
export class GeneradorForm implements OnInit {
  @Output() saved = new EventEmitter<any>();
public today: string = '';
  step = 0;
  totalSteps = 5;

  vehicleForm!: FormGroup;
  proyecto!: FormGroup;
  DocumentsForm!: FormGroup;
  infoextra!: FormGroup;
   documentos!: FormGroup;
   contacto!: FormGroup;

  generadorId!: string | null;
  form!: FormGroup;
minDate: string;

  barriosActuales$: Observable<string[]> = of([]);
  barriosFiltrados$: Observable<string[]> = of([]);
  idGenerador: any;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
    private ProyectoServ: ProyectoService,
    private archivoSrv: ArchivoService,
    private generadorServ: GeneradorService,
      private http: HttpClient,
  ) {
     this.minDate = new Date().toISOString().split('T')[0];


      // FORMULARIO CONTACTO
        this.contacto = this.fb.group({
          tipo_de_solicitante: ['', Validators.required],
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

    // -------------------------------
    // 🟩 INFO EXTRA
    // -------------------------------
    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['',Validators.required],
      consecutivo_sigob: ['',Validators.required],
      valor:[0,Validators.required]
    });

    
   this.form = this.fb.group({
      contacto : this.contacto,
      proyecto: this.proyecto,
      DocumentsForm:this.DocumentsForm,      
      infoextra: this.infoextra,
      
    });

   


 this.proyecto.addControl('latitud', this.fb.control(null));
    this.proyecto.addControl('longitud', this.fb.control(null));

    

    // -------------------------------
    // 🟩 DOCUMENTOS
    // -------------------------------
    this.DocumentsForm = this.fb.group({

carta_solicitud: ['', Validators.required],
  descripcion_tecnica_proyecto: ['', Validators.required],
  certificado_tradicion_libertad: ['', Validators.required],
  autorizacion_bic: ['', Validators.required],
  registro_defuncion: [''],
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

ngOnInit(): void {
    const localidadControl = this.contacto.get('localidad');
    const barrioControl = this.contacto.get('barrio');
    if (!localidadControl || !barrioControl) return;

    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value));

    this.barriosActuales$ = localidad$.pipe(
      switchMap((loc: string) =>
        loc ? this.http.get<any[]>(`assets/${loc}.json`).pipe(
          map(data => data.map(item => item.name)),
          catchError(() => of([]))
        ) : of([])
      )
    );

    this.barriosFiltrados$ = combineLatest([this.barriosActuales$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        const t = ('' + texto).toLowerCase();
        return barrios.filter(b => b.toLowerCase().includes(t));
      })
    );

    localidad$.subscribe(() => barrioControl.setValue(''));

    // VALIDACIÓN DINÁMICA
    const tipoControl = this.contacto.get('tipo_de_solicitante')!;
    tipoControl.valueChanges.pipe(startWith(tipoControl.value)).subscribe((tipo: string) => {
      const identificacion = this.contacto.get('identificacion')!;
      const certExt = this.contacto.get('cert_ext_legal')!;

      if (tipo === 'Persona Natural') {
        identificacion.setValidators([Validators.required]);
        certExt.clearValidators();
        certExt.setValue('');
      } else if (tipo === 'Persona Jurídica') {
        certExt.setValidators([Validators.required]);
        identificacion.clearValidators();
        identificacion.setValue('');
      } else {
        identificacion.clearValidators();
        certExt.clearValidators();
      }

      identificacion.updateValueAndValidity();
      certExt.updateValueAndValidity();
    });
  }


  
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
  //nextsetep con validacion
   // -------------------------------

nextStep() {
  console.log("Proyecto group:", this.proyecto);

  if (this.step === 4) {
    this.onSubmit();
    return;
  }

  let g =
    this.step === 0 ? this.contacto
    : this.step === 1 ? this.proyecto
    : this.step === 2 ? this.DocumentsForm
    : this.step === 3 ? this.infoextra
    : null;

  if (g && g.invalid) {
    g.markAllAsTouched();
    this.toast.showError('Completa todos los campos obligatorios antes de continuar.');
    return;
  }

  if (this.step < this.totalSteps - 1) {
    this.step++;
  }
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
      this.DocumentsForm.get(controlName)?.setValue('');
      return;
    }
    this.DocumentsForm.get(controlName)?.setValue(input.files[0]);
  }
// project-form.component.ts

  getUploadedDocuments(): string[] {
    const docs = this.DocumentsForm.value;
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
  const c = this.contacto.value;
  const v = this.proyecto.value;
  const d = this.DocumentsForm.value;
  const i = this.infoextra.value;

  // -----------------------------
  // 📌 DATOS PARA GENERADOR
  // -----------------------------
  const tipoDocumento =
    c.tipo_de_solicitante === 'Persona Natural' ? 'cedula' : 'NIT';

  const numeroDocumento =
    c.tipo_de_solicitante === 'Persona Natural'
      ? c.documento_de_identidad
      : c.nit;

  const nombres = c.nombres_y_apellidos?.trim().split(' ') || [];

  const Generador = {
    idtransportador: 0,

    tipoDocumento: tipoDocumento,
    numeroDocumento: numeroDocumento,

    primerNombre: tipoDocumento === 'cedula' ? nombres[0] || '' : '',
    segundoNombre: tipoDocumento === 'cedula' ? nombres[1] || '' : '',
    primerApellidos: tipoDocumento === 'cedula' ? nombres[2] || '' : '',
    segundoApellido: tipoDocumento === 'cedula' ? nombres[3] || '' : '',

    razonSocial: tipoDocumento === 'NIT' ? c.razon_social || null : null,

    documentoIdentificacion: d.identificacion
      ? this.extractFilename(d.identificacion)
      : '',

    documentoRUT: d.cert_ext_legal
      ? this.extractFilename(d.cert_ext_legal)
      : '',

    direccion: c.direccion_de_correspondencia_del_solicitante,
    correoElectronico: c.correo_electronico,

    telefono:
      c.telefono_fijo?.toString().trim() !== ''
        ? parseInt(c.telefono_fijo)
        : null,

    fax: '',
    celular: c.telefono_movil || null,

    clave: numeroDocumento,

    ciiu: null,
    tipoDocumentoRL: null,
    numeroDocumentoRL: null,
    nombreRL: null,
    emailRL: null
  };

  // -----------------------------
  // 📌 DATOS PARA PROYECTO
  // -----------------------------
  const Proyecto = {
    nombre: v.nombre_del_proyecto,
    ubicacion: v.direccion_del_proyecto,

    tipoUsoPredio:
      v.datos_predios && v.datos_predios.length > 0
        ? v.datos_predios[0].referencia_catastral
        : null,

    localidad: v.localidad_proyecto,
    barrio: v.barrio_proyecto,

    matriculaInmobiliaria: "123456",
    referenciaCatastral: v.referencia_catastral,

    fechaInicio: v.fecha_inicio,
    fechaFin: v.fecha_final,

    estadoProyecto: "No reportado",
    numLicenciaUrbanismo: null,
    fechaExpLicUrb: null,
    titularLicUrb: null,
    tipoIdentLicUrb: null,
    identificacionLicUrb: null,

    curaduria: null,

    areaVerdes: null,
    areaConstruccionAprobada: null,

    valor: i.valor,
    volumenEstimGenrEscombros: null,
    volumenEstimEscavaciones: null,

    idgenerador: 0,

    fechaExpedicionPIN: i.fecha_expedicion_pin,
    codigoRadicadoSIGOD: i.consecutivo_sigob,

    CoordenadaX: v.latitud != null ? String(v.latitud) : null,
    CoordenadaY: v.longitud != null ? String(v.longitud) : null,

    tipo: v.tipo_de_generador,

    // -----------------------------
    // 📌 DOCUMENTOS
    // -----------------------------
    carta_solicitud: this.extractFilename(d.carta_solicitud),
    descripcion_tecnica_proyecto: this.extractFilename(
      d.descripcion_tecnica_proyecto
    ),
    certificado_tradicion_libertad: this.extractFilename(
      d.certificado_tradicion_libertad
    ),
    autorizacion_bic: this.extractFilename(d.autorizacion_bic),
    registro_defuncion: this.extractFilename(d.registro_defuncion),
    cuadro_cantidades_rcd: this.extractFilename(d.cuadro_cantidades_rcd),
    soporte_pago_pin: this.extractFilename(d.soporte_pago_pin),
    cronograma_actividades: this.extractFilename(d.cronograma_actividades),
    planos_aprobados_curaduria: this.extractFilename(
      d.planos_aprobados_curaduria
    ),
    contrato_obra_otros: this.extractFilename(d.contrato_obra_otros),
    resolucion_curaduria_o_licencia: this.extractFilename(
      d.resolucion_curaduria_o_licencia
    ),
    programa_manejo_rcd_pdf: this.extractFilename(
      d.programa_manejo_rcd_pdf
    ),
    autorizacion_bicBigOrSmall: this.extractFilename(
      d.autorizacion_bicBigOrSmall
    ),
    certificado_no_requiere_licencia: this.extractFilename(
      d.certificado_no_requiere_licencia
    ),
    permiso_ocupacion_cauce: this.extractFilename(
      d.permiso_ocupacion_cauce
    ),

    // -----------------------------
    // 📌 INFORMACIÓN EXTRA
    // -----------------------------
    fecha_expedicion_pin: i.fecha_expedicion_pin,
    fecha_vencimiento_pin: this.addOneYear(i.fecha_expedicion_pin),
    consecutivo_sigob: i.consecutivo_sigob
  };

  return { Generador, Proyecto };
}


  // -------------------------------
  // ENVÍO DEL FORMULARIO
  // -------------------------------
  async onSubmit(): Promise<void> {
    console.log(this.proyecto,'proye',this.DocumentsForm,'doc',this.infoextra,'infoex')
    if (this.proyecto.invalid || this.DocumentsForm.invalid || this.infoextra.invalid) {
      this.proyecto.markAllAsTouched();
      this.DocumentsForm.markAllAsTouched();
      this.infoextra.markAllAsTouched();
      this.toast.showError('Completa todos los campos obligatorios.');
      return;
    }

    try {
// 0 crear geneador obteniendo el id
//Crear generador + id
const { Generador, Proyecto } = this.buildPayload();
      const creado = await this.generadorServ.crearGenerador(
        Generador
      );
console.log(creado.idgenerador)
      this.idGenerador = creado.idgenerador;


     // 1️⃣ Crear un Proyecto
  //modificar el atributo de proyecto
  Proyecto.idgenerador = this.idGenerador;
      const ProyecroBaseResp: any = await this.ProyectoServ.crearProyecto(Proyecto);
      const idProyecto = ProyecroBaseResp.idProyecto;

      // 2️⃣ SUBIR DOCUMENTOS CON NOMBRE RENOMBRADO
      const docs = this.DocumentsForm.value;
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
      carta_solicitud: archivosRenombrados['carta_solicitud'] || null,
  descripcion_tecnica_proyecto: archivosRenombrados['descripcion_tecnica_proyecto'] || null,
  certificado_tradicion_libertad: archivosRenombrados['certificado_tradicion_libertad'] || null,
  autorizacion_bic: archivosRenombrados['autorizacion_bic'] || null,
  registro_defuncion: archivosRenombrados['registro_defuncion'] || null,
  cuadro_cantidades_rcd: archivosRenombrados['cuadro_cantidades_rcd'] || null,
  soporte_pago_pin: archivosRenombrados['soporte_pago_pin'] || null,
  cronograma_actividades: archivosRenombrados['cronograma_actividades'] || null,
  planos_aprobados_curaduria: archivosRenombrados['planos_aprobados_curaduria'] || null,
  contrato_obra_otros: archivosRenombrados['contrato_obra_otros'] || null,
  resolucion_curaduria_o_licencia: archivosRenombrados['resolucion_curaduria_o_licencia'] || null,
  programa_manejo_rcd_pdf: archivosRenombrados['programa_manejo_rcd_pdf'] || null,
  autorizacion_bicBigOrSmall: archivosRenombrados['autorizacion_bicBigOrSmall'] || null,
  certificado_no_requiere_licencia: archivosRenombrados['certificado_no_requiere_licencia'] || null,
  permiso_ocupacion_cauce: archivosRenombrados['permiso_ocupacion_cauce'] || null,
        
      };

      await this.ProyectoServ.actualizarProyecto(idProyecto, proyectoUpdate);

      // 4️⃣ EMITIR EVENTO Y MENSAJE
      this.saved.emit({ ...proyectoUpdate });
      this.toast.showSuccess(
        'Generador creado correctamente',
        '/generador-detalle/' + this.idGenerador
      );
    } catch (err) {
      console.error(err);
      this.toast.showError('Error al procesar el registro.');
    }
  }
}

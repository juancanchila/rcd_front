import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ToastService } from '../../services/toast.service';
import { ReceptorService } from '../../services/receptor.service';
import { ArchivoService } from '../../services/archivo.service';
import { ResolucionService } from '../../services/resolucion.service';

@Component({
  selector: 'gestor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './gestor-form.component.html',
  styleUrls: ['./gestor-form.component.css'],
})
export class GestorFormComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 5;

  form!: FormGroup;
  contacto!: FormGroup;
  gestor!: FormGroup;
  documentos!: FormGroup;
  infoextra!: FormGroup;

  barriosFiltrados$: Observable<string[]> = of([]);
  barriosFiltradosGestor$: Observable<string[]> = of([]);

  archivos: { [key: string]: File | null } = {};
  rcdNoAprovechable: { [key: string]: any } = {};
  uploadedDocs: File[] = [];
  minDate: string;
  rcdAprovechable: { [key: string]: any } = {};


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
    private receptorSrv: ReceptorService,
    private archivoSrv: ArchivoService,
    private resolucionSrv: ResolucionService,
    private snack: MatSnackBar
  ) {

      this.rcdAprovechable = {
      '1_1': 'Productos de excavación y sobrantes de la adecuación de terreno',
      '1_2': 'Productos de cimentaciones y pilotajes',
      '1_3': 'Pétreos: hormigón, arenas, gravas...',
      '1_4': 'No pétreos: vidrio, metales, plásticos...',
    };

    this.rcdNoAprovechable = {
      '2_1': 'Contaminados con residuos peligrosos',
      '2_2': 'Estado no aprovechable',
      '2_3': 'Características de peligrosidad',
    };
     this.minDate = new Date().toISOString().split('T')[0];
    // ==========================
    // FORMULARIOS
    // ==========================
    this.contacto = this.fb.group({
      tipo_de_solicitante: ['', Validators.required],
      nombres_y_apellidos: [''],
      documento_de_identidad: [''],
      razon_social: [''],
      nit: [''],
      correo_electronico: ['', [Validators.required, Validators.email]],
      telefono_movil: ['', Validators.required],
      telefono_fijo: [''],
      localidad: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion_de_correspondencia_del_solicitante: ['', Validators.required],
    });

    this.gestor = this.fb.group({
      localidad_gestor: ['', Validators.required],
      barrio_gestor: ['', Validators.required],
      direccion_gestor: ['', Validators.required],
      fecha_inicio: [''],
      fecha_final: ['', Validators.required],
      tipo_rcd: [''],
      actividad_ejecutada: ['', Validators.required],
      capacidad_t_mes: [0, [Validators.required, Validators.min(0)]],
      capacidad_total_t: [0, [Validators.required, Validators.min(0)]],
      '1_1': [false],
      '1_2': [false],
      '1_3': [false],
      '1_4': [false],
      '2_1': [false],
      '2_2': [false],
      '2_3': [false],
      latitud: [null, Validators.required],
      longitud: [null, Validators.required],
    }, {
      validators: (form) => {
        const inicio = form.get('fecha_inicio')?.value;
        const fin = form.get('fecha_final')?.value;
        if (!inicio || !fin) return null;
        return new Date(inicio) <= new Date(fin) ? null : { fechaInvalida: true };
      },
    });

    this.documentos = this.fb.group({
      identificacion: [''],
      cert_ext_rep_legal: [''],
      medidas_manejo_ambiental: ['', Validators.required],
      permisos_licencias_autorizaciones: ['', Validators.required],
      certificacion_pot: ['', Validators.required],
      planos_rcd_materiaprima: [''],
      documento_tecnico_rcd_materiaprima: [''],
      permisos_rcd_materiaprima: [''],
      licencia_urbanistica_rcd: [''],
      viabilidad_ambiental_rcd: [''],
      documento_tecnico_rcd_estructural: [''],
      planos_topograficos_rcd: [''],
      medidas_manejo_disp_final: [''],
      permisos_disp_final: [''],
      certificacion_pot_disp_final: [''],
    });

    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['', Validators.required],
      consecutivo_sigob: ['', Validators.required],
    });

    this.form = this.fb.group({
      contacto: this.contacto,
      gestor: this.gestor,
      documentos: this.documentos,
      infoextra: this.infoextra,
    });
  }



  ngOnInit(): void {
    this.setupBarrios();
    this.setupBarriosGestor();
    this.setupTipoSolicitanteValidation();
    this.setupDocumentosValidation();
  }

  // ==========================
  // VALIDACIONES DINÁMICAS
  // ==========================
  private setupTipoSolicitanteValidation() {
    this.contacto.get('tipo_de_solicitante')!.valueChanges
      .pipe(startWith(this.contacto.get('tipo_de_solicitante')!.value))
      .subscribe(tipo => {
        const identificacion = this.documentos.get('identificacion')!;
        const certExt = this.documentos.get('cert_ext_rep_legal')!;

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

  private setupDocumentosValidation() {
    this.gestor.get('actividad_ejecutada')!.valueChanges
      .pipe(startWith(this.gestor.get('actividad_ejecutada')!.value))
      .subscribe(act => {
        Object.keys(this.documentos.controls).forEach(ctrl => this.documentos.get(ctrl)!.clearValidators());
        ['medidas_manejo_ambiental', 'permisos_licencias_autorizaciones', 'certificacion_pot']
          .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        if (act === 'receptor_rcd_materia_prima') {
          ['planos_rcd_materiaprima', 'documento_tecnico_rcd_materiaprima', 'permisos_rcd_materiaprima']
            .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        } else if (act === 'receptor_rcd_estructural') {
          ['licencia_urbanistica_rcd', 'viabilidad_ambiental_rcd', 'documento_tecnico_rcd_estructural', 'planos_topograficos_rcd']
            .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        } else if (act === 'disposicion_final') {
          ['medidas_manejo_disp_final', 'permisos_disp_final', 'certificacion_pot_disp_final']
            .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        }
        Object.keys(this.documentos.controls).forEach(ctrl => this.documentos.get(ctrl)!.updateValueAndValidity());
      });
  }

  // ==========================
  // BARRIOS
  // ==========================
  private setupBarrios() {
    const locCtrl = this.contacto.get('localidad')!;
    const brrCtrl = this.contacto.get('barrio')!;
    const loc$ = locCtrl.valueChanges.pipe(startWith(locCtrl.value));
    const brr$ = brrCtrl.valueChanges.pipe(startWith(brrCtrl.value));
    const barrios$ = loc$.pipe(
      switchMap(loc => loc ? this.http.get<any[]>(`assets/${loc}.json`).pipe(map(d => d.map(i => i.name)), catchError(() => of([]))) : of([]))
    );
    this.barriosFiltrados$ = combineLatest([barrios$, brr$]).pipe(
      map(([barrios, txt]) => !txt ? barrios : barrios.filter(b => b.toLowerCase().includes((''+txt).toLowerCase())))
    );
    loc$.subscribe(() => brrCtrl.setValue(''));
  }

  private setupBarriosGestor() {
    const locCtrl = this.gestor.get('localidad_gestor')!;
    const brrCtrl = this.gestor.get('barrio_gestor')!;
    const loc$ = locCtrl.valueChanges.pipe(startWith(locCtrl.value));
    const brr$ = brrCtrl.valueChanges.pipe(startWith(brrCtrl.value));
    const barrios$ = loc$.pipe(
      switchMap(loc => loc ? this.http.get<any[]>(`assets/${loc}.json`).pipe(map(d => d.map(i => i.name)), catchError(() => of([]))) : of([]))
    );
    this.barriosFiltradosGestor$ = combineLatest([barrios$, brr$]).pipe(
      map(([barrios, txt]) => !txt ? barrios : barrios.filter(b => b.toLowerCase().includes((''+txt).toLowerCase())))
    );
    loc$.subscribe(() => brrCtrl.setValue(''));
  }

  // ==========================
  // VALIDACIONES GENERALES
  // ==========================
  isInvalid(ctrlName: string, group?: FormGroup) {
    const g = group || this.form;
    const c = g.get(ctrlName);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  isRequired(ctrlName: string, group?: FormGroup) {
    const g = group || this.form;
    const c = g.get(ctrlName);
    if (!c || !c.validator) return false;
    const r = c.validator({} as any);
    return !!(r && r['required']);
  }

  onFileSelected(event: Event, ctrlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.documentos.get(ctrlName)?.setValue('');
      this.archivos[ctrlName] = null;
      return;
    }
    const file = input.files[0];
    this.documentos.get(ctrlName)?.setValue(file);
    this.archivos[ctrlName] = file;
    this.uploadedDocs.push(file);
  }

  // ==========================
  // MULTISTEP
  // ==========================
  nextStep() {
    const grp = this.step === 0 ? this.contacto : this.step === 1 ? this.gestor : this.step === 2 ? this.documentos : this.infoextra;
    if (grp.invalid) {
      grp.markAllAsTouched();
      this.snack.open('Completa todos los campos obligatorios.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() { if (this.step > 0) this.step--; }

  // ==========================
  // BUILD PAYLOAD
  // ==========================
  private buildPayload() {
    const c = this.contacto.value;
    const g = this.gestor.value;
    const d = this.documentos.value;
    const i = this.infoextra.value;

    const nombres = c.nombres_y_apellidos?.trim().split(' ') || [];
    const tipoDocumento = c.tipo_de_solicitante === 'Persona Natural' ? 'cedula' : 'NIT';
    const numeroDocumento = tipoDocumento === 'cedula' ? c.documento_de_identidad : c.nit;

    const receptor = {
      tipoDocumento,
      numeroDocumento,
      primerNombre: tipoDocumento === 'cedula' ? nombres[0] || '' : '',
      segundoNombre: tipoDocumento === 'cedula' ? nombres[1] || '' : '',
      primerApellido: tipoDocumento === 'cedula' ? nombres[2] || '' : '',
      segundoApellido: tipoDocumento === 'cedula' ? nombres[3] || '' : '',
      razonSocial: tipoDocumento === 'NIT' ? c.razon_social || null : null,
      direccion: c.direccion_de_correspondencia_del_solicitante,
      correoElectronico: c.correo_electronico,
      telefono: c.telefono_movil,
    };

    const resolucion = {
      fechaInicio: g.fecha_inicio,
      fechaFin: g.fecha_final,
      actividad: g.actividad_ejecutada,
      tipoAprovechamiento: g.tipo_rcd,
      capacidadTotal: g.capacidad_total_t,
      coordenadaX: g.latitud,
      coordenadaY: g.longitud,
      archivos: { ...this.archivos },
    };

    return { receptor, resolucion };
  }

  // ==========================
  // SUBMIT
  // ==========================
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa todos los campos antes de guardar.', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      const { receptor, resolucion } = this.buildPayload();

      // 1. Crear receptor
      const respReceptor: any = await this.receptorSrv.crearReceptor(receptor);
      const idReceptor = respReceptor?.idreceptor ?? respReceptor?.data?.idreceptor;
      if (!idReceptor) throw new Error('No se obtuvo ID del receptor');

      // 2. Subir archivos
   const archivosRenombrados: any = {};
for (const key of Object.keys(this.archivos)) {
  const file = this.archivos[key];
  if (file instanceof File) {
    const nuevoNombre = `${idReceptor}_${key}_${file.name}`;
    const renamedFile = new File([file], nuevoNombre, { type: file.type });

    const resp: any = await this.archivoSrv.subirArchivo(renamedFile);
    archivosRenombrados[key] = resp?.filename ?? nuevoNombre;
  }
}


      // 3. Crear resolución
      const respResolucion: any = await this.resolucionSrv.crearResolucion({
        ...resolucion,
        receptorId: idReceptor,
      });

      // 4. Actualizar receptor con archivos y resolución
      await this.receptorSrv.actualizarReceptor(idReceptor, {
        resoluciones: [respResolucion?.idresolucion],
        archivos: archivosRenombrados
      });

      this.saved.emit({ receptor: respReceptor, resolucion: respResolucion, archivos: archivosRenombrados });
      this.toast.showSuccess('Formulario guardado correctamente.');
    } catch (error) {
      console.error(error);
      this.toast.showError('Error al guardar el formulario.');
    }
  }
}

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { ToastService } from '../../services/toast.service';
import { TransportadorService } from '../../services/transportador.service';
import { ArchivoService } from '../../services/archivo.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { MapPickerComponent } from '../map-picker/map-picker.component';

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
    MatRadioModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MapPickerComponent,
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
  vehiculo!: FormGroup;
  documentos!: FormGroup;
  infoextra!: FormGroup;
  gestor!: FormGroup;

  barriosActuales$: Observable<string[]> = of([]);
  barriosFiltrados$: Observable<string[]> = of([]);
  barriosActualesGestor$: Observable<string[]> = of([]);
  barriosFiltradosGestor$: Observable<string[]> = of([]);

  minDate: string;
  rcdAprovechable: { [key: string]: string };
  rcdNoAprovechable: { [key: string]: string };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,
    private toast: ToastService,
    private transportadorSrv: TransportadorService,
    private archivoSrv: ArchivoService,
    private vehiculoSrv: VehiculoService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];

    // -----------------------------
    // FORMULARIOS
    // -----------------------------
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

    this.vehiculo = this.fb.group({});

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
    });

    this.gestor.addControl('latitud', this.fb.control(null));
    this.gestor.addControl('longitud', this.fb.control(null));

    this.rcdAprovechable = {
      '1_1': 'Productos de excavación y sobrantes de la adecuación de terreno...',
      '1_2': 'Productos de cimentaciones y pilotajes: arcillas, bentonitas y demás',
      '1_3': 'Pétreos: hormigón, arenas, gravas, gravillas, cantos, pétreos asfálticos...',
      '1_4': 'No pétreos: vidrio, metales, plásticos, espumas, gomas, madera, drywall...',
    };

    this.rcdNoAprovechable = {
      '2_1': 'Los contaminados con residuos peligrosos',
      '2_2': 'Los que por su estado no pueden ser aprovechados',
      '2_3': 'Los que tengan características de peligrosidad',
    };

    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['', Validators.required],
      fecha_vencimiento_pin: ['', Validators.required],
      consecutivo_sigob: ['', Validators.required],
    });

    // -----------------------------
    // DOCUMENTOS
    // -----------------------------
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

    this.form = this.fb.group({
      contacto: this.contacto,
      vehiculo: this.vehiculo,
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

  // ==============================
  // BARRIOS CONTACTO
  // ==============================
  private setupBarrios() {
    const localidadControl = this.contacto.get('localidad')!;
    const barrioControl = this.contacto.get('barrio')!;

    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value || ''));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value || ''));

    this.barriosActuales$ = localidad$.pipe(
      switchMap((loc: string) =>
        loc
          ? this.http.get<any[]>(`assets/${loc}.json`).pipe(
              map((data) => data.map((item) => item.name)),
              catchError(() => of([]))
            )
          : of([])
      )
    );

    this.barriosFiltrados$ = combineLatest([this.barriosActuales$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        const t = ('' + texto).toLowerCase();
        return barrios.filter((b: string) => b.toLowerCase().includes(t));
      })
    );

    localidad$.subscribe(() => barrioControl.setValue(''));
  }

  // ==============================
  // BARRIOS GESTOR
  // ==============================
  private setupBarriosGestor() {
    const localidadControl = this.gestor.get('localidad_gestor')!;
    const barrioControl = this.gestor.get('barrio_gestor')!;

    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value || ''));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value || ''));

    this.barriosActualesGestor$ = localidad$.pipe(
      switchMap((loc: string) =>
        loc
          ? this.http.get<any[]>(`assets/${loc}.json`).pipe(
              map((data) => data.map((item) => item.name)),
              catchError(() => of([]))
            )
          : of([])
      )
    );

    this.barriosFiltradosGestor$ = combineLatest([this.barriosActualesGestor$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        const t = ('' + texto).toLowerCase();
        return barrios.filter((b: string) => b.toLowerCase().includes(t));
      })
    );

    localidad$.subscribe(() => barrioControl.setValue(''));
  }

  // ==============================
  // TIPO SOLICITANTE
  // ==============================
  private setupTipoSolicitanteValidation() {
    const tipoControl = this.contacto.get('tipo_de_solicitante')!;
    tipoControl.valueChanges.pipe(startWith(tipoControl.value)).subscribe((tipo: string) => {
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

  // ==============================
  // DOCUMENTOS DINÁMICOS SEGÚN ACTIVIDAD
  // ==============================
  private setupDocumentosValidation() {
    const actividadControl = this.gestor.get('actividad_ejecutada')!;
    actividadControl.valueChanges.pipe(startWith(actividadControl.value)).subscribe((actividad) => {
      // Limpiar validaciones dinámicas
      Object.keys(this.documentos.controls).forEach((ctrl) => this.documentos.get(ctrl)!.clearValidators());

      // Documentos obligatorios generales
      ['medidas_manejo_ambiental', 'permisos_licencias_autorizaciones', 'certificacion_pot'].forEach((ctrl) =>
        this.documentos.get(ctrl)!.setValidators([Validators.required])
      );

      // Documentos según actividad
      if (actividad === 'receptor_rcd_materia_prima') {
        ['planos_rcd_materiaprima', 'documento_tecnico_rcd_materiaprima', 'permisos_rcd_materiaprima'].forEach((ctrl) =>
          this.documentos.get(ctrl)!.setValidators([Validators.required])
        );
      } else if (actividad === 'receptor_rcd_estructural') {
        ['licencia_urbanistica_rcd', 'viabilidad_ambiental_rcd', 'documento_tecnico_rcd_estructural', 'planos_topograficos_rcd'].forEach(
          (ctrl) => this.documentos.get(ctrl)!.setValidators([Validators.required])
        );
      } else if (actividad === 'disposicion_final') {
        ['medidas_manejo_disp_final', 'permisos_disp_final', 'certificacion_pot_disp_final'].forEach((ctrl) =>
          this.documentos.get(ctrl)!.setValidators([Validators.required])
        );
      }

      // Actualizar validaciones
      Object.keys(this.documentos.controls).forEach((ctrl) => this.documentos.get(ctrl)!.updateValueAndValidity());
    });
  }

  // ==============================
  // MANEJO DE ARCHIVOS
  // ==============================
  onFileSelected(event: any, controlName: string) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.documentos.get(controlName)?.setValue(file);
    console.log(`Archivo seleccionado (${controlName}): ${file.name}`);
  }

  private extractFilename(value: any): string {
    if (!value) return '';
    if (value instanceof File) return value.name;
    return value;
  }

  // ==============================
  // MAPA
  // ==============================
  onMap(coords: { latitude: number; longitude: number }): void {
    this.gestor.patchValue({
      latitud: coords.latitude,
      longitud: coords.longitude,
    });
  }

  // ==============================
  // PAGINACIÓN
  // ==============================
  nextStep() {
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
  }

  // ==============================
  // UTILIDADES
  // ==============================
  isInvalid(controlName: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const ctrl = g.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isRequired(name: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const c = g.get(name);
    if (!c || !c.validator) return false;
    const result = c.validator({} as any);
    return !!(result && result['required']);
  }

  getUploadedDocuments(): string[] {
    const docs = this.documentos.value;
    return Object.keys(docs)
      .filter((key) => docs[key] !== null && docs[key] !== undefined && docs[key] !== '')
      .map((key) => key.replace(/_/g, ' '));
  }

  // ==============================
  // SUBMIT
  // ==============================
  private buildPayload() {
    return {
      contacto: this.contacto.value,
      gestor: this.gestor.value,
      vehiculo: this.vehiculo.value,
      documentos: this.documentos.value,
      infoextra: this.infoextra.value,
    };
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.toast.showError('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    try {
      this.saved.emit(this.buildPayload());
      this.toast.showSuccess('Formulario guardado correctamente.');
    } catch (error) {
      this.toast.showError('Error al guardar el formulario.');
      console.error(error);
    }
  }

  // ==============================
  // KEYS PARA TEMPLATE
  // ==============================
  get rcdAprovechableKeys(): string[] {
    return Object.keys(this.rcdAprovechable);
  }

  get rcdNoAprovechableKeys(): string[] {
    return Object.keys(this.rcdNoAprovechable);
  }
}

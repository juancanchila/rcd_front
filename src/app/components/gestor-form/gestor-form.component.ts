import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ToastService } from '../../services/toast.service';
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
  totalSteps = 4;

  form!: FormGroup;
  contacto!: FormGroup;
  gestor!: FormGroup;
  documentos!: FormGroup;
  infoextra!: FormGroup;

  barriosFiltrados$: Observable<string[]> = of([]);
  barriosFiltradosGestor$: Observable<string[]> = of([]);

  minDate: string;
  rcdAprovechable: { [key: string]: string };
  rcdNoAprovechable: { [key: string]: string };

  constructor(private fb: FormBuilder, private http: HttpClient, private toast: ToastService) {
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
    });

    this.gestor.addControl('latitud', this.fb.control(null));
    this.gestor.addControl('longitud', this.fb.control(null));

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
      fecha_vencimiento_pin: ['', Validators.required],
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
  // MÉTODOS PEDIDOS
  // ==========================
  public isInvalid(controlName: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const ctrl = g.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  public get uploadedDocs(): { name: string; file: any }[] {
    const docs = this.documentos.value;
    return Object.keys(docs)
      .filter((key) => docs[key])
      .map((key) => {
        const file = docs[key];
        return {
          name: file instanceof File ? file.name : file.toString(),
          file: file,
        };
      });
  }

  // ==========================
  // CAPTURA DE ARCHIVOS
  // ==========================
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.documentos.get(controlName)?.setValue('');
      return;
    }
    this.documentos.get(controlName)?.setValue(input.files[0]);
  }

  // ==========================
  // MAPA
  // ==========================
  onMap(coords: { latitude: number; longitude: number }) {
    this.gestor.patchValue({ latitud: coords.latitude, longitud: coords.longitude });
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
      .subscribe(actividad => {
        Object.keys(this.documentos.controls).forEach(ctrl => this.documentos.get(ctrl)!.clearValidators());

        ['medidas_manejo_ambiental', 'permisos_licencias_autorizaciones', 'certificacion_pot']
          .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));

        if (actividad === 'receptor_rcd_materia_prima') {
          ['planos_rcd_materiaprima', 'documento_tecnico_rcd_materiaprima', 'permisos_rcd_materiaprima']
            .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        } else if (actividad === 'receptor_rcd_estructural') {
          ['licencia_urbanistica_rcd', 'viabilidad_ambiental_rcd', 'documento_tecnico_rcd_estructural', 'planos_topograficos_rcd']
            .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        } else if (actividad === 'disposicion_final') {
          ['medidas_manejo_disp_final', 'permisos_disp_final', 'certificacion_pot_disp_final']
            .forEach(ctrl => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        }

        Object.keys(this.documentos.controls).forEach(ctrl => this.documentos.get(ctrl)!.updateValueAndValidity());
      });
  }

  // ==========================
  // PAGINACIÓN
  // ==========================
  nextStep() { if (this.step < this.totalSteps - 1) this.step++; }
  prevStep() { if (this.step > 0) this.step--; }

  // ==========================
  // UTILIDADES
  // ==========================
  isRequired(controlName: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const ctrl = g.get(controlName);
    if (!ctrl || !ctrl.validator) return false;
    const result = ctrl.validator({} as any);
    return !!(result && result['required']);
  }

  // ==========================
  // SUBMIT
  // ==========================
  buildPayload() {
    return {
      contacto: this.contacto.value,
      gestor: this.gestor.value,
      documentos: this.documentos.value,
      infoextra: this.infoextra.value,
    };
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toast.showError('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    try {
      this.saved.emit(this.buildPayload());
      this.toast.showSuccess('Formulario guardado correctamente.');
    } catch (error) {
      console.error(error);
      this.toast.showError('Error al guardar el formulario.');
    }
  }

  get rcdAprovechableKeys(): string[] { return Object.keys(this.rcdAprovechable); }
  get rcdNoAprovechableKeys(): string[] { return Object.keys(this.rcdNoAprovechable); }

  // ==========================
  // FILTRO DE BARRIOS
  // ==========================
  private setupBarrios() {
    const localidadControl = this.contacto.get('localidad')!;
    const barrioControl = this.contacto.get('barrio')!;

    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value || ''));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value || ''));

    const barriosActuales$ = localidad$.pipe(
      switchMap((loc: string) =>
        loc
          ? this.http.get<any[]>(`assets/barrios/${loc}.json`).pipe(
              map((data) => data.map((item) => item.name)),
              catchError(() => of([]))
            )
          : of([])
      )
    );

    this.barriosFiltrados$ = combineLatest([barriosActuales$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        return barrios.filter((b: string) => b.toLowerCase().includes(texto.toLowerCase()));
      })
    );

    localidad$.subscribe(() => barrioControl.setValue(''));
  }

  private setupBarriosGestor() {
    const localidadControl = this.gestor.get('localidad_gestor')!;
    const barrioControl = this.gestor.get('barrio_gestor')!;

    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value || ''));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value || ''));

    const barriosActualesGestor$ = localidad$.pipe(
      switchMap((loc: string) =>
        loc
          ? this.http.get<any[]>(`assets/barrios/${loc}.json`).pipe(
              map((data) => data.map((item) => item.name)),
              catchError(() => of([]))
            )
          : of([])
      )
    );

    this.barriosFiltradosGestor$ = combineLatest([barriosActualesGestor$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        return barrios.filter((b: string) => b.toLowerCase().includes(texto.toLowerCase()));
      })
    );

    localidad$.subscribe(() => barrioControl.setValue(''));
  }
}

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
import { MapPickerComponent } from '../map-picker/map-picker.component';
import { ActivatedRoute } from '@angular/router';

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
  templateUrl: './resolution-form.component.html',
  styleUrls: ['./resolution-form.component.css'],
})
export class ResolutionFormComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 4; // contacto no lo usamos, step 0 = gestor
  isSubmitting = false;
  form!: FormGroup;
  gestor!: FormGroup;
  documentos!: FormGroup;
  infoextra!: FormGroup;

  barriosFiltradosGestor$: Observable<string[]> = of([]);

  minDate: string;
  rcdAprovechable: { [key: string]: string };
  rcdNoAprovechable: { [key: string]: string };

  archivos: { [key: string]: File | null } = {};
  uploadedDocs: File[] = [];

  gestorId: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
    private archivoSrv: ArchivoService,
    private resolucionSrv: ResolucionService,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.gestorId = this.route.snapshot.paramMap.get('id');

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

    // ==========================
    // FORMULARIOS
    // ==========================
    this.gestor = this.fb.group(
      {
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
      },
      {
        validators: (form) => {
          const inicio = form.get('fecha_inicio')?.value;
          const fin = form.get('fecha_final')?.value;
          if (!inicio || !fin) return null;
          return new Date(inicio) <= new Date(fin) ? null : { fechaInvalida: true };
        },
      }
    );

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
      planos_del_puntolimio: [''],// falta agregae solo cunado sea punto limpio
      libertad_tradicion_inmueble: [''],// todos los casos
    });

    this.infoextra = this.fb.group({
      fecha_expedicion_pin: ['', Validators.required],
      consecutivo_sigob: ['', Validators.required],
      cantidad_autorizada: ['', Validators.required],
      clave: ['', Validators.required],
      numeroResolucion: ['', Validators.required],
    });

    this.form = this.fb.group({
      gestor: this.gestor,
      documentos: this.documentos,
      infoextra: this.infoextra,
    });
  }

  ngOnInit(): void {
    this.setupBarriosGestor();
    this.setupDocumentosValidation();
    this.setupTipoRcd();
  }

  isInvalid(ctrlName: string, group?: FormGroup) {
    const g = group || this.form;
    const c = g.get(ctrlName);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  private setupTipoRcd() {
    this.gestor
      .get('tipo_rcd')!
      .valueChanges.pipe(startWith(this.gestor.get('tipo_rcd')!.value))
      .subscribe((tipo) => {
        const keysA = Object.keys(this.rcdAprovechable);
        const keysNA = Object.keys(this.rcdNoAprovechable);
        if (tipo === 'aprovechable') keysNA.forEach((k) => this.gestor.get(k)?.setValue(false));
        else if (tipo === 'no_aprovechable')
          keysA.forEach((k) => this.gestor.get(k)?.setValue(false));
        else [...keysA, ...keysNA].forEach((k) => this.gestor.get(k)?.setValue(false));
      });
  }

  private setupDocumentosValidation() {
    this.gestor
      .get('actividad_ejecutada')!
      .valueChanges.pipe(startWith(this.gestor.get('actividad_ejecutada')!.value))
      .subscribe((act) => {
        Object.keys(this.documentos.controls).forEach((ctrl) =>
          this.documentos.get(ctrl)!.clearValidators()
        );
        [
          'medidas_manejo_ambiental',
          'permisos_licencias_autorizaciones',
          'certificacion_pot',
        ].forEach((ctrl) => this.documentos.get(ctrl)!.setValidators([Validators.required]));

        if (act === 'receptor_rcd_materia_prima') {
          [
            'planos_rcd_materiaprima',
            'documento_tecnico_rcd_materiaprima',
            'permisos_rcd_materiaprima',
          ].forEach((ctrl) => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        } else if (act === 'receptor_rcd_estructural') {
          [
            'licencia_urbanistica_rcd',
            'viabilidad_ambiental_rcd',
            'documento_tecnico_rcd_estructural',
            'planos_topograficos_rcd',
          ].forEach((ctrl) => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        } else if (act === 'disposicion_final') {
          [
            'medidas_manejo_disp_final',
            'permisos_disp_final',
            'certificacion_pot_disp_final',
          ].forEach((ctrl) => this.documentos.get(ctrl)!.setValidators([Validators.required]));
        }

        Object.keys(this.documentos.controls).forEach((ctrl) =>
          this.documentos.get(ctrl)!.updateValueAndValidity()
        );
      });
  }

  private setupBarriosGestor() {
    const locCtrl = this.gestor.get('localidad_gestor')!;
    const brrCtrl = this.gestor.get('barrio_gestor')!;
    const loc$ = locCtrl.valueChanges.pipe(startWith(locCtrl.value));
    const brr$ = brrCtrl.valueChanges.pipe(startWith(brrCtrl.value));
    const barrios$ = loc$.pipe(
      switchMap((loc) =>
        loc
          ? this.http.get<any[]>(`assets/${loc}.json`).pipe(
              map((d) => d.map((i) => i.name)),
              catchError(() => of([]))
            )
          : of([])
      )
    );
    this.barriosFiltradosGestor$ = combineLatest([barrios$, brr$]).pipe(
      map(([barrios, txt]) =>
        !txt ? barrios : barrios.filter((b) => b.toLowerCase().includes(('' + txt).toLowerCase()))
      )
    );
    loc$.subscribe(() => brrCtrl.setValue(''));
  }

  onMap(coords: { latitude: number; longitude: number }): void {
    this.gestor.patchValue({ latitud: coords.latitude, longitud: coords.longitude });
  }

  // ==========================
  // MULTISTEP
  // ==========================
  nextStep() {
    const grp = this.step === 0 ? this.gestor : this.step === 1 ? this.documentos : this.infoextra;
    if (grp.invalid) {
      grp.markAllAsTouched();
      this.snack.open('Completa todos los campos obligatorios.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
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
  // BUILD PAYLOAD
  // ==========================
  private buildPayload() {
    const g = this.gestor.value;
    const i = this.infoextra.value;

    const ubicacion = [
      g.direccion_gestor?.trim(),
      g.barrio_gestor?.trim(),
      g.localidad_gestor?.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    const resolucion = {
      numeroResolucion:
        i.numeroResolucion?.trim() ||
        (() => {
          throw new Error('Falta numeroResolucion');
        })(),
      ubicacion:
        ubicacion ||
        (() => {
          throw new Error('Falta ubicacion');
        })(),
      localidad: g.localidad_gestor?.trim() || null,
      naturalezaActividad: g.actividad_ejecutada?.trim() || null,
      tipoAprovechamiento: g.tipo_rcd?.trim() || null,
      fechaInicio:
        g.fecha_inicio?.trim() ||
        (() => {
          throw new Error('Falta fechaInicio');
        })(),
      fechaFin: g.fecha_final?.trim() || null,
      cantidadRCD: g.cantidad_rcd?.trim() || null,
      CoordenadaX: g.latitud != null ? String(g.latitud) : null,
      CoordenadaY: g.longitud != null ? String(g.longitud) : null,
      fechaExpedicionPIN: i.fecha_expedicion_pin?.trim() || null,
      codigoRadicadoSIGOD: i.consecutivo_sigob?.trim() || null,
      tipo: g.actividad_ejecutada?.trim() || null,
      cantidad_autorizada:
        i.cantidad_autorizada != null ? `${i.cantidad_autorizada} toneladas` : '0 toneladas',
    };
    return { resolucion };
  }

  // ==========================
  // SUBMIT
  // ==========================
  async onSubmit() {
    if (this.isSubmitting) return; // evita doble clic
    this.isSubmitting = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa todos los campos antes de guardar.', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      // 1. Crear resolución
      const { resolucion } = this.buildPayload();
      const respResolucion: any = await this.resolucionSrv.crearResolucion({
        ...resolucion,
        idReceptor: this.gestorId,
      });
      const idResolucion = respResolucion?.idresolucion;
      if (!idResolucion) throw new Error('No se obtuvo ID de la resolución');

      // 2. Subir archivos renombrados con ID de resolución
      const archivosRenombrados: any = {};
      for (const key of Object.keys(this.archivos)) {
        const file = this.archivos[key];
        if (file instanceof File) {
          const nuevoNombre = `${idResolucion}_${key}_${file.name}`;
          const renamedFile = new File([file], nuevoNombre, { type: file.type });
          const resp: any = await this.archivoSrv.subirArchivo(renamedFile);
          archivosRenombrados[key] = resp?.filename ?? nuevoNombre;
        }
      }

      // 3. Actualizar resolución con archivos
      await this.resolucionSrv.actualizarResolucion(idResolucion, {
        archivos: archivosRenombrados,
      });

      this.saved.emit({
        resolucion: respResolucion,
        archivos: archivosRenombrados,
      });

      this.toast.showSuccess('Resolución guardada correctamente.');

      this.toast.showSuccess(
        'Resolución guardada correctamente.',
        '/receptor-detalle/' + this.gestorId
      );
    } catch (error) {
      console.error(error);
      this.toast.showError('Error al guardar la resolución.');

      this.isSubmitting = false; // sí reactivar si hubo error
    }
  }

  get rcdAprovechableKeys(): string[] {
    return Object.keys(this.rcdAprovechable);
  }
  get rcdNoAprovechableKeys(): string[] {
    return Object.keys(this.rcdNoAprovechable);
  }
}

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

@Component({
  selector: 'transportador-form',
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
    MatIconModule
  ],
  templateUrl: './transportador-form.component.html',
  styleUrls: ['./transportador-form.component.css']
})
export class TransportadorFormComponent implements OnInit {

  @Output() saved = new EventEmitter<any>();

  step = 0;
  totalSteps = 5;

  form!: FormGroup;
  contacto!: FormGroup;
  vehiculo!: FormGroup;
  vehiculodocuments!: FormGroup;
  infoextra!: FormGroup;

  barriosActuales$: Observable<string[]> = of([]);
  barriosFiltrados$: Observable<string[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,
    private toast: ToastService,
    private transportadorSrv: TransportadorService,
    private archivoSrv: ArchivoService,
    private vehiculoSrv: VehiculoService
  ) {

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

    // FORMULARIO VEHICULO
    this.vehiculo = this.fb.group({
      unidad_capacidad: ['kg', Validators.required],
      capacidad_vehiculo: ['', [Validators.required, Validators.min(1)]],
      clase_vehiculo: ['', Validators.required],
      placa_vehiculo: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
    });

    // FORMULARIO INFO EXTRA
this.infoextra = this.fb.group({
  fecha_expedicion_pin: ['', Validators.required],
  fecha_vencimiento_pin: ['', Validators.required],
  consecutivo_sigob: ['', Validators.required]
});

    // FORMULARIO DOCUMENTOS
    this.vehiculodocuments = this.fb.group({
      identificacion: [''],
      cert_ext_legal: [''],
      licencia_transito: ['', Validators.required],
      foto_frontal: ['', Validators.required],
      foto_trasera: ['', Validators.required],
      foto_lateral_derecha: ['', Validators.required],
      foto_lateral_izquierda: ['', Validators.required],
      registro_herramientas: [''],
      certificado_leasing: [''],
      certificado_tecnicomecanica: ['', Validators.required],
      registro_defuncion: [''],
      autoriza_propietario: [''],
    });

    this.form = this.fb.group({
      contacto: this.contacto,
      vehiculo: this.vehiculo,
      vehiculodocuments: this.vehiculodocuments
    });
  }

  // ===========================================
  //                 INIT
  // ===========================================

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
      const identificacion = this.vehiculodocuments.get('identificacion')!;
      const certExt = this.vehiculodocuments.get('cert_ext_legal')!;

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

  // ===========================================
  //        MÉTODO QUE FALTABA: isInvalid
  // ===========================================

  isInvalid(controlName: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const ctrl = g.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  // ===========================================
  //                WIZARD
  // ===========================================

  nextStep() {
    const currentGroup = this.getCurrentGroup();

    if (currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      this.snack.open('Completa todos los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
  }

  getCurrentGroup(): FormGroup {
    return this.step === 0 ? this.contacto
      : this.step === 1 ? this.vehiculo
      : this.step === 2 ? this.vehiculodocuments
      : this.form;
  }

  // ===========================================
  //           CARGA DE ARCHIVOS
  // ===========================================

  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.vehiculodocuments.get(controlName)?.setValue('');
      return;
    }
    this.vehiculodocuments.get(controlName)?.setValue(input.files[0]);
  }

  // ===========================================
  //            SABER SI ES REQUIRED
  // ===========================================

  isRequired(name: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const c = g.get(name);
    if (!c || !c.validator) return false;
    const result = c.validator({} as any);
    return !!(result && result['required']);
  }

  // ===========================================
  //       MOSTRAR NOMBRE DE ARCHIVO CARGADO
  // ===========================================

  getUploadedDocuments(): string[] {
    const docs = this.vehiculodocuments.value;
    return Object.keys(docs)
      .filter(key => {
        const v = docs[key];
        return v !== null && v !== undefined && v !== '';
      })
      .map(key => key.replace(/_/g, ' '));
  }

  // Extraer nombre correcto
  private extractFilename(value: any): string {
    if (!value) return '';
    if (value instanceof File) return value.name;
    return value;
  }

  // ===========================================
  //           ARMAR PAYLOAD COMPLETO
  // ===========================================

 private buildPayload() {
  const c = this.contacto.value;
  const v = this.vehiculo.value;
  const d = this.vehiculodocuments.value;
  const i = this.infoextra.value;
  const tipoDocumento =
    c.tipo_de_solicitante === 'Persona Natural' ? 'cedula' : 'NIT';

  const numeroDocumento =
    c.tipo_de_solicitante === 'Persona Natural'
      ? c.documento_de_identidad
      : c.nit;

  const nombres = c.nombres_y_apellidos?.trim().split(' ') || [];

  const transportador = {
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


    const vehiculo = {
  idvehiculo: 0,
  placaVehiculo: v.placa_vehiculo.toUpperCase(),
  lugarExpedicion: c.localidad,
  modelo: v.modelo,
  capacidad: `${v.capacidad_vehiculo} ${v.unidad_capacidad}`,
  fechaUltimaRevTecMec: null, // ✔️ AHORA EN NULL
  permisoMovilizacion: null,
  nombreConductor: null,
  numeroIdentificacion: null,

  fotoFrente: this.extractFilename(d.foto_frontal),
  fotoLadoDerecho: this.extractFilename(d.foto_lateral_derecha),
  fotoLadoIzquierdo: this.extractFilename(d.foto_lateral_izquierda),
  fotoTrasera: this.extractFilename(d.foto_trasera),

  idtransportador: 0,
  pin: '',

  licenciaTransito: this.extractFilename(d.licencia_transito),
  certificadoRevTecMec: this.extractFilename(d.certificado_tecnicomecanica),

  // 🔥 CAMPOS NUEVOS 🔥
  fechaExpedicionPIN: i.fecha_expedicion_pin,
  fechaVencimientoPIN: this.addOneYear(i.fecha_expedicion_pin), // ✔️ UN AÑO DESPUÉS
  codigoRadicadoSIGOD: i.consecutivo_sigob
};


    return { transportador, vehiculo };
  }

  addOneYear(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0]; // formato YYYY-MM-DD
}

  // ===========================================
  //                SUBMIT FINAL
  // ===========================================

  async onSubmit(): Promise<void> {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa todos los campos antes de guardar.', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      const { transportador, vehiculo } = this.buildPayload();

      // 1. Crear transportador + vehículo base
      const creado = await this.transportadorSrv.crearTransportadorConVehiculo(
        transportador,
        vehiculo
      );

      const idTransportador = creado.transportador.idtransportador;
      const idVehiculo = creado.vehiculo.idvehiculo;

      // 2. Subir archivos y renombrar
      const docs = this.vehiculodocuments.value;
      const archivosRenombrados: any = {};

      for (const key of Object.keys(docs)) {
        const file = docs[key];
        if (file instanceof File) {
          const nuevoNombre = `${idVehiculo}_${key}_${file.name}`;
          const renamedFile = new File([file], nuevoNombre, { type: file.type });

          const uploadResp: any = await this.archivoSrv.subirArchivo(renamedFile);
          archivosRenombrados[key] = uploadResp?.filename || nuevoNombre;
        }
      }

      // 3. Actualizar vehículo
      const vehiculoUpdate: any = {
        ...vehiculo,
        fotoFrente: archivosRenombrados['foto_frontal'] || vehiculo.fotoFrente,
        fotoLadoDerecho: archivosRenombrados['foto_lateral_derecha'] || vehiculo.fotoLadoDerecho,
        fotoLadoIzquierdo: archivosRenombrados['foto_lateral_izquierda'] || vehiculo.fotoLadoIzquierdo,
        fotoTrasera: archivosRenombrados['foto_trasera'] || vehiculo.fotoTrasera,
        licenciaTransito: archivosRenombrados['licencia_transito'] || vehiculo.licenciaTransito,
        certificadoRevTecMec: archivosRenombrados['certificado_tecnicomecanica'] || vehiculo.certificadoRevTecMec,
      };

      await this.vehiculoSrv.actualizarVehiculo(idVehiculo, vehiculoUpdate);

      // 4. Emitir y toast
      this.saved.emit({
        transportador: creado.transportador,
        vehiculo: { idvehiculo: idVehiculo, ...vehiculoUpdate }
      });

      this.toast.showSuccess('Vehículo y transportador creados correctamente', '/lista/transportador/');

    } catch (err) {
      console.error(err);
      this.toast.showError('Error al procesar el registro');
    }
  }
}

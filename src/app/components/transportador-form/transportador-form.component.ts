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
  totalSteps = 4;

  form!: FormGroup;
  contacto!: FormGroup;
  vehiculo!: FormGroup;
  vehiculodocuments!: FormGroup;

  barriosActuales$: Observable<string[]> = of([]);
  barriosFiltrados$: Observable<string[]> = of([]);

  constructor(private fb: FormBuilder, private http: HttpClient, private snack: MatSnackBar, private toast: ToastService) {
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

    this.vehiculo = this.fb.group({
      unidad_capacidad: ['kg', Validators.required],
      capacidad_vehiculo: ['', [Validators.required, Validators.min(1)]],
      clase_vehiculo: ['', Validators.required],
      placa_vehiculo: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
    });

    // Inicializar sin obligar identificacion / cert_ext_legal; serán controlados dinámicamente
    this.vehiculodocuments = this.fb.group({
      identificacion: [''],
      cert_ext_legal: [''],
      licencia_transito: ['', Validators.required],
      foto_frontal: ['', Validators.required],
      foto_trasera: ['', Validators.required],
      foto_lateral_derecha: ['', Validators.required],
      foto_lateral_izquierda: ['', Validators.required],
      registro_herramientas: ['', Validators.required],
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

  ngOnInit(): void {
    const localidadControl = this.contacto.get('localidad');
    const barrioControl = this.contacto.get('barrio');
    if (!localidadControl || !barrioControl) return;

    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value));

    this.barriosActuales$ = localidad$.pipe(
      switchMap((loc: string) => loc ? this.http.get<any[]>(`assets/${loc}.json`).pipe(
        map(data => data.map(item => item.name)),
        catchError(() => of([]))
      ) : of([]))
    );

    this.barriosFiltrados$ = combineLatest([this.barriosActuales$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        const t = ('' + texto).toLowerCase();
        return barrios.filter(b => b.toLowerCase().includes(t));
      })
    );

    localidad$.subscribe(() => barrioControl.setValue(''));

    // Validaciones dinámicas según tipo de solicitante
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

  nextStep() {
    const currentGroup = this.getCurrentGroup();
    if (currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      this.snack.open('Completa todos los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.step < this.totalSteps - 1) this.step++;
  }

  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      // limpiar si el usuario quita el archivo manualmente
      this.vehiculodocuments.get(controlName)?.setValue('');
      this.vehiculodocuments.get(controlName)?.markAsTouched();
      return;
    }

    const file = input.files[0];
    this.vehiculodocuments.get(controlName)?.setValue(file);
    this.vehiculodocuments.get(controlName)?.markAsTouched();
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

  isInvalid(controlName: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const ctrl = g.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  // Método mejorado para saber si un campo es requerido; acepta grupo opcional
  isRequired(controlName: string, group?: FormGroup): boolean {
    const g = group || this.form;
    const control = g.get(controlName);
    if (!control || !control.validator) return false;
    // Ejecutar el validador con un valor dummy para detectar 'required'
    const validationResult = control.validator({} as any);
    return !!(validationResult && validationResult['required']);
  }

  getUploadedDocuments(): string[] {
    const docs = this.vehiculodocuments.value;
    return Object.keys(docs)
      .filter(key => {
        const v = docs[key];
        return v !== null && v !== undefined && v !== '';
      })
      .map(key => key.replace(/_/g, ' '));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa todos los campos antes de guardar.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.saved.emit(this.form.value);

    this.toast.showSuccess(
      'Vehículo guardado correctamente',
      '/lista/transportador/'
    );
  }
}
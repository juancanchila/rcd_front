import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GeneratorGeneralDocumentsComponent } from "../generator-general-documents/generator-general-documents.component";

@Component({
  selector: 'project-data',
  standalone: true,
   imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule, // <-- obligatorio
    MatInputModule, // <-- obligatorio si hay matInput
    MatSelectModule, // <-- si hay mat-select
    MatOptionModule, // <-- si hay mat-option
    MatAutocompleteModule, // <-- si hay mat-autocomplete
    MatDatepickerModule, // <-- si hay mat-datepicker
    MatNativeDateModule, // <-- adaptador de fechas
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatExpansionModule,
    GeneratorGeneralDocumentsComponent
],
  templateUrl: './project-data.component.html',
})
export class ProjectDataComponent implements OnInit {
  @Input() group!: FormGroup;

  barriosActuales$: Observable<string[]> = of([]);
  barriosFiltrados$: Observable<string[]> = of([]);

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Inicializar FormArray vacío
    if (!this.group.get('datos_predios')) {
      this.group.addControl('datos_predios', this.fb.array([]));
    }
    if (this.datosPredios.length === 0) this.agregarPredio();

    const localidadControl = this.group.get('localidad_proyecto');
    const barrioControl = this.group.get('barrio_proyecto');

    if (!localidadControl || !barrioControl) return;

    // Observables para cambios de valores
    const localidad$ = localidadControl.valueChanges.pipe(startWith(localidadControl.value));
    const barrioInput$ = barrioControl.valueChanges.pipe(startWith(barrioControl.value));

    // Cargar barrios según localidad
    this.barriosActuales$ = localidad$.pipe(
      switchMap((loc: string) => {
        if (!loc) return of([]);
        const url = `assets/${loc}.json`; // <-- ruta correcta
        return this.http.get<any[]>(url).pipe(
          map((data) => data.map((item) => (typeof item === 'string' ? item : item.name))),
          catchError((err) => {
            console.error(`Error cargando ${url}:`, err);
            return of([]);
          })
        );
      })
    );

    // Filtrar barrios según input
    this.barriosFiltrados$ = combineLatest([this.barriosActuales$, barrioInput$]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        const t = ('' + texto).toLowerCase();
        return barrios.filter((b) => b.toLowerCase().includes(t));
      })
    );

    // Limpiar barrio cuando cambia localidad
    localidad$.subscribe(() => barrioControl.setValue(''));
  }

  // Getter para el FormArray de predios
  get datosPredios(): FormArray {
    return this.group.get('datos_predios') as FormArray;
  }

  // Tipo de generador
  get tipoGenerador() {
    return this.group.get('tipo_de_generador')?.value;
  }

  // Agregar predio
  agregarPredio(): void {
    this.datosPredios.push(
      this.fb.group({
        referencia_catastral: [''],
        matricula_inmobiliaria: [''],
      })
    );
  }

  // Eliminar predio
  eliminarPredio(index: number): void {
    this.datosPredios.removeAt(index);
  }
}

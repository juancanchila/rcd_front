import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'contact-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    HttpClientModule,
  ],
  templateUrl: './contact-data.component.html',
})
export class ContactDataComponent implements OnInit {
  @Input() group!: FormGroup;

  barriosActuales$: Observable<string[]> = of([]);
  barriosFiltrados$: Observable<string[]> = of([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const localidadControl = this.group.get('localidad');
    const barrioControl = this.group.get('barrio');

    if (!localidadControl || !barrioControl) return;

    const localidad$ = localidadControl.valueChanges.pipe(
      startWith(localidadControl.value)
    );

    const barrioInput$ = barrioControl.valueChanges.pipe(
      startWith(barrioControl.value)
    );

    // Cargar los barrios desde el archivo JSON correspondiente
    this.barriosActuales$ = localidad$.pipe(
      switchMap((loc: string) => {
        if (!loc) return of([]);

        const url = `assets/${loc}.json`;

        return this.http.get<any[]>(url).pipe(
          // Mapear solo los nombres del campo "name"
          map((data) => data.map((item) => item.name)),
          catchError((err) => {
            console.error(`Error cargando ${url}:`, err);
            return of([]);
          })
        );
      })
    );

    // Filtrar barrios según texto del usuario
    this.barriosFiltrados$ = combineLatest([
      this.barriosActuales$,
      barrioInput$,
    ]).pipe(
      map(([barrios, texto]) => {
        if (!texto) return barrios;
        const t = ('' + texto).toLowerCase();
        return barrios.filter((b) => b.toLowerCase().includes(t));
      })
    );

    // Limpiar barrio al cambiar localidad
    localidad$.subscribe(() => {
      barrioControl.setValue('');
    });
  }
}

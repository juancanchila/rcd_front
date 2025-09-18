import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

import { Generador } from '../../models/generador.model';
import { Proyecto } from '../../models/proyecto.model';
import { Transportador } from '../../models/transportador.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { VehiculoConsulta } from '../../models/vehiculoconsulta.model';
import { Receptor } from '../../models/receptor.model';
import { Resolucion } from '../../models/resolucion.model';

@Component({
  selector: 'app-pin-consulta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pin-consulta.component.html',
  styleUrls: ['./pin-consulta.component.scss']
})
export class PinConsultaComponent {
  consultaForm: FormGroup;

  generador: Generador | null = null;
  proyectos: Proyecto[] = [];

  transportador: Transportador | null = null;
  vehiculos: Vehiculo[] = [];

  receptor: Receptor | null = null;
  resoluciones: Resolucion[] = [];

  // Vehículo por placa
  vehiculo: VehiculoConsulta | null = null;

  loading = false;

  constructor(private fb: FormBuilder, private httpService: HttpService, private router: Router) {
    this.consultaForm = this.fb.group({
      tipo: ['', Validators.required],
      valor: ['', Validators.required]
    });
  }

async consultar() {
  if (!this.consultaForm.valid) return;

  this.loading = true;
  this.resetDatos();

  const { tipo, valor } = this.consultaForm.value;
  const url = `http://161.35.233.204:3002/api/pin?tipo=${tipo}&valor=${valor}`;

  try {
    const res: any = await this.httpService.get<any>(url).toPromise();
    console.log('✅ Respuesta de la consulta:', res);

    switch (tipo) {
      case 'generador':
        if (res?.idgenerador) {
          this.generador = Generador.fromResponse(res);
          this.proyectos = Array.isArray(res.proyectos)
            ? res.proyectos.map((p: any) => Proyecto.fromResponse(p))
            : [];
        }
        break;

      case 'transportador':
        if (res?.idtransportador) {
          this.transportador = Transportador.fromResponse(res);
          this.vehiculos = Array.isArray(res.vehiculos)
            ? res.vehiculos.map((v: any) => Vehiculo.fromResponse(v))
            : [];
        }
        break;

      case 'receptor':
        if (res?.idreceptor) {
          this.receptor = Receptor.fromResponse(res);
          this.resoluciones = Array.isArray(res.resoluciones)
            ? res.resoluciones.map((r: any) => Resolucion.fromResponse(r))
            : [];
        }
        break;

      case 'vehiculo':
        if (res?.idvehiculo) {
          this.vehiculo = VehiculoConsulta.fromResponse(res);
          console.log('✅ Vehículo encontrado:', this.vehiculo);
        }
        break;

      default:
        console.warn('⚠️ Tipo de consulta desconocido o sin datos.');
    }

  } catch (error) {
    console.error('❌ Error en consulta:', error);
  } finally {
    this.loading = false;
  }
}


  private resetDatos() {
    this.generador = null;
    this.proyectos = [];
    this.transportador = null;
    this.vehiculos = [];
    this.receptor = null;
    this.resoluciones = [];
    this.vehiculo = null;
  }

  goToPinResolucion(id: number) { this.router.navigate(['/pin/resolucion/', id]); }
  goToPinProyecto(id: number) { this.router.navigate(['/pin/proyecto/', id]); }
  goToPinVehiculo(id: number) { this.router.navigate(['/pin/vehiculo/', id]); }
}

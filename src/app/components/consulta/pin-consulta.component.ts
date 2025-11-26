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
import { environment } from '../../../environments/environment.prod';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './pin-consulta.component.html',
  styleUrls: ['./pin-consulta.component.css'],
})
export class PinConsultaComponent {
  private baseUrl = environment.API_URL;
  consultaForm: FormGroup;

  // 👀 ahora TODOS son arrays para soportar múltiples resultados
  generadores: Generador[] = [];
  transportadores: Transportador[] = [];
  receptores: Receptor[] = [];
  vehiculosConsulta: VehiculoConsulta[] = [];

  loading = false;

  constructor(private fb: FormBuilder, private httpService: HttpService, private router: Router) {
    this.consultaForm = this.fb.group({
      tipo: ['', Validators.required],
      valor: ['', Validators.required],
    });
  }

  async consultar() {
    if (!this.consultaForm.valid) return;

    this.loading = true;
    this.resetDatos();

    const { tipo, valor } = this.consultaForm.value;
    const url = `${this.baseUrl}/pin?tipo=${tipo}&valor=${valor}`;

    try {
      const res: any = await this.httpService.get<any>(url).toPromise();
      console.log('✅ Respuesta de la consulta:', res);

      switch (tipo) {
        case 'generador':
          if (Array.isArray(res)) {
            this.generadores = res.map((g: any) => Generador.fromResponse(g));
          } else if (res?.idgenerador) {
            this.generadores = [Generador.fromResponse(res)];
          }
          break;

        case 'transportador':
          if (Array.isArray(res)) {
            this.transportadores = res.map((t: any) => Transportador.fromResponse(t));
          }
          break;

        case 'receptor':
          if (Array.isArray(res)) {
            this.receptores = res.map((r: any) => Receptor.fromResponse(r));
          } else if (res?.idreceptor) {
            this.receptores = [Receptor.fromResponse(res)];
          }
          break;

        case 'vehiculo':
          if (Array.isArray(res)) {
            this.vehiculosConsulta = res.map((v: any) => VehiculoConsulta.fromResponse(v));
          } else if (res?.idvehiculo) {
            this.vehiculosConsulta = [VehiculoConsulta.fromResponse(res)];
          }
          break;

        default:
          console.warn('⚠️ Tipo no reconocido.');
      }
    } catch (error) {
      console.error('❌ Error en consulta:', error);
    } finally {
      this.loading = false;
    }
  }

  private resetDatos() {
    this.generadores = [];
    this.transportadores = [];
    this.receptores = [];
    this.vehiculosConsulta = [];
  }

  goToPinResolucion(id: number) {
    this.router.navigate(['/pin/resolucion/', id]);
  }
  goToPinProyecto(id: number) {
    this.router.navigate(['/pin/proyecto/', id]);
  }
  goToPinVehiculo(id: number) {
    this.router.navigate(['/pin/vehiculo/', id]);
  }
}

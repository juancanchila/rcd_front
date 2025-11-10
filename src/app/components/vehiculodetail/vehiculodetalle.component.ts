import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Vehiculo } from '../../models/vehiculo.model';
import { VehiculoService } from '../../services/vehiculo.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-vehiculodetalle',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    SharedFooterComponent,
  ],
  templateUrl: './vehiculodetalle.component.html',
  styleUrls: ['./vehiculodetalle.component.scss']
})
export class VehiculodetalleComponent implements OnInit {
  vehiculo: Vehiculo | null = null;
  loading: boolean = false;

  constructor(
    private vehiculoService: VehiculoService,
    private route: ActivatedRoute,
       private router: Router
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      await this.cargarVehiculo(id);
    }
  }

  async cargarVehiculo(id: number) {
    this.loading = true;
    try {
      const res = await this.vehiculoService.obtenerVehiculoPorId(id);
      this.vehiculo = Vehiculo.fromResponse(res);
    } catch (err) {
      console.error('Error cargando vehículo:', err);
      this.vehiculo = null;
    } finally {
      this.loading = false;
    }
  }

    goToPin(id: number) {
    this.router.navigate(['/pin/proyecto/', id]);
  }

encodeImage(fileName: string | null): string {
  if (!fileName) return '';
  // URL completa hacia el backend para descargar la imagen
  return 'https://rcdenlinea.epacartagena.gov.co/api/files/' + encodeURIComponent(fileName);
}

encodeUrl(fileName: string | null): string {
  if (!fileName) return '#'; // placeholder si no hay archivo
  // URL completa hacia el backend para abrir en nueva pestaña
  return 'https://rcdenlinea.epacartagena.gov.co/api/files/' + encodeURIComponent(fileName);
}

}

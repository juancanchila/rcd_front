import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransportadorService } from '../../services/transportador.service';
import { Transportador } from '../../models/transportador.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-detalle-transportador',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    SharedFooterComponent
  ],
  templateUrl: './detalle-transportador.component.html',
  styleUrls: ['./detalle-transportador.component.scss']
})
export class DetalleTransportadorComponent implements OnInit {
  transportador: Transportador | null = null;
  vehiculos: Vehiculo[] = [];
  loading = false;
  private id: number | undefined;

  constructor(
    private transportadorService: TransportadorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
   this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      await this.cargarTransportador(this.id);
    }
  }

  async cargarTransportador(id: number) {
    this.loading = true;
    try {
      const res = await this.transportadorService.obtenerTransportadorPorId(id);

      if (res && res.idtransportador) {
        this.transportador = Transportador.fromResponse(res);

        if (Array.isArray(res.vehiculos)) {
          this.vehiculos = res.vehiculos.map((v: any) =>
            Vehiculo.fromResponse ? Vehiculo.fromResponse(v) : v
          );
        } else {
          this.vehiculos = [];
        }
      } else {
        this.transportador = null;
        this.vehiculos = [];
      }
    } catch (err) {
      console.error('Error cargando transportador:', err);
      this.transportador = null;
      this.vehiculos = [];
    } finally {
      this.loading = false;
    }
  }
 agregarVehiculo() {
  this.router.navigate([`/transportador/${this.id}/vehiculo-create`]);
}
  goToDetalle(id: number) {
    this.router.navigate(['/vehiculo-detalle', id]);
  }
  goToPin(id: number) {
    this.router.navigate(['/pin/vehiculo', id]);
  }
  volver() {
    this.router.navigate(['/transportadores']);
  }
   // Detecta si el archivo es imagen
  isImage(file: string | null): boolean {
    if (!file) return false;
    const ext = file.split('.').pop()?.toLowerCase();
    return ['jpg','jpeg','png','gif'].includes(ext || '');
  }

  // URL para mostrar imagen
  encodeImage(file: string | null): string {
    if (!file) return '';
    return `https://rcdenlinea.epacartagena.gov.co/api/files/${encodeURIComponent(file)}`;
  }

  // URL para abrir documentos en nueva pestaña
  encodeUrl(file: string | null): string {
    if (!file) return '#';
    return `https://rcdenlinea.epacartagena.gov.co/api/files/${encodeURIComponent(file)}`;
  }
}

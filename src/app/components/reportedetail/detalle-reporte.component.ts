import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReporteImpPmaRcdService } from '../../services/reporteimp-pma.service';
import { ReporteImpPmaRcd } from '../../models/reporteimp.model';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-detalle-reporte',
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
  templateUrl: './detalle-reporte.component.html',
  styleUrls: ['./detalle-reporte.component.scss']
})
export class DetalleReporteComponent implements OnInit {
  loading = false;
  reporte?: ReporteImpPmaRcd;

  constructor(
    private route: ActivatedRoute,
    private service: ReporteImpPmaRcdService
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      await this.cargarReporte(id);
    } else {
      console.error('ID inválido');
    }
  }

  private async cargarReporte(id: number) {
    this.loading = true;
    try {
      const resp = await this.service.obtenerReportePorId(id);
      this.reporte = resp ? ReporteImpPmaRcd.fromResponse(resp) : undefined;
    } catch (err) {
      console.error('Error cargando reporte:', err);
    } finally {
      this.loading = false;
    }
  }
}

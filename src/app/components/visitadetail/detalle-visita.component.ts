import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { VisitaTecnicaService } from '../../services/visitatecnica.service';
import { VisitaTecnica } from '../../models/visitatecnica.model';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-detalle-visita',
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
  templateUrl: './detalle-visita.component.html',
  styleUrls: ['./detalle-visita.component.scss'],
})
export class DetalleVisitaComponent implements OnInit {
  visita: VisitaTecnica | null = null;
  loading = false;

  constructor(
    private visitaService: VisitaTecnicaService,
    private route: ActivatedRoute,
     private router: Router
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      await this.cargarVisita(id);
    }
  }

  private async cargarVisita(id: number) {
    this.loading = true;
    try {
      const res = await this.visitaService.obtenerVisitaTecnicasPorId(id);
      this.visita = res ? VisitaTecnica.fromResponse(res) : null;
    } catch (err) {
      console.error('Error cargando visita técnica:', err);
      this.visita = null;
    } finally {
      this.loading = false;
    }
  }

  encodeUrl(fileName: string | null): string {
  if (!fileName) return '#'; // o devuelve una URL vacía o un placeholder
  return '/files/apprcd/upload/' + encodeURIComponent(fileName);
}


}

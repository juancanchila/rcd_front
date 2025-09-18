// src/app/components/proyectodetail/detalle-proyecto.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProyectoService } from '../../services/proyecto.service';
import { Proyecto } from '../../models/proyecto.model';
import { VisitaTecnica } from '../../models/visitatecnica.model';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-detalle-proyecto',
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
  templateUrl: './detalle-proyecto.component.html',
  styleUrls: ['./detalle-proyecto.component.scss'],
})
export class DetalleProyectoComponent implements OnInit {
  proyecto: Proyecto | null = null;
  visitas: VisitaTecnica[] = [];
  loading = false;

  constructor(
    private proyectoService: ProyectoService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      await this.cargarProyecto(id);
    }
  }

  private async cargarProyecto(id: number) {
    this.loading = true;

    try {
      const res = await this.proyectoService.obtenerProyectoPorId(id);
      console.log('Respuesta del servicio:', res);
      if (res && res.idProyecto) {
        this.proyecto = Proyecto.fromResponse(res);
        this.visitas = Array.isArray(res.visitas)
          ? res.visitas.map((v: any) => VisitaTecnica.fromResponse(v))
          : [];
      } else {
        this.proyecto = null;
        this.visitas = [];
      }
    } catch (err) {
      console.error('Error cargando proyecto:', err);
      this.proyecto = null;
      this.visitas = [];
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.location.back();
  }
     goToDetalle(id: number) {
    this.router.navigate(['/visitatecnica-detalle', id]);
  }
   goToPin(id: number) {
    this.router.navigate(['/pin/proyecto/', id]);
  }
}

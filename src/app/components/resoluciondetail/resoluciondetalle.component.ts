import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Resolucion } from '../../models/resolucion.model';
import { ResolucionService } from '../../services/resolucion.service';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-resoluciondetalle',
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
  templateUrl: './resoluciondetalle.component.html',
  styleUrls: ['./resoluciondetalle.component.scss'],
})
export class ResoluciondetalleComponent implements OnInit {
  resolucion: Resolucion | null = null;
  loading = false;

  constructor(
    private resolucionService: ResolucionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      await this.cargarResolucion(id);
    }
  }

  async cargarResolucion(id: number) {
    this.loading = true;
    try {
      const res = await this.resolucionService.obtenerResolucionPorId(id);
      if (res && res.idresolucion) {
        this.resolucion = Resolucion.fromResponse(res);
      } else {
        this.resolucion = null;
      }
    } catch (err) {
      console.error('Error cargando resolución:', err);
      this.resolucion = null;
    } finally {
      this.loading = false;
    }
  }

  volver() {
    this.router.navigate(['/resoluciones']);
  }
    goToPin(id: number) {
    this.router.navigate(['/pin/resolucion', id]);
  }
}

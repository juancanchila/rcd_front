import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import { GeneradorService } from '../../services/generador.service';
import { Generador } from '../../models/generador.model';
import { Proyecto } from '../../models/proyecto.model';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-detalle-generador',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    SharedFooterComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './detalle-generador.component.html',
  styleUrls: ['./detalle-generador.component.scss'],
})
export class DetalleGeneradorComponent implements OnInit {
  generador: Generador | null = null;
  proyectos: Proyecto[] = [];
  loading = false;

  constructor(
    private generadorService: GeneradorService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      await this.cargarGenerador(id);
    }
  }

  private async cargarGenerador(id: number) {
    this.loading = true;
    try {
      const res = await this.generadorService.obtenerGeneradorPorId(id);

      if (res && res.idgenerador) {
        this.generador = Generador.fromResponse(res);
        this.proyectos = Array.isArray(res.proyectos)
          ? res.proyectos.map((p: any) => Proyecto.fromResponse(p))
          : [];
      } else {
        this.generador = null;
        this.proyectos = [];
      }
    } catch (err) {
      console.error('Error cargando generador:', err);
      this.generador = null;
      this.proyectos = [];
    } finally {
      this.loading = false;
    }
  }

  goToDetalle(id: number) {
    this.router.navigate(['/proyecto-detalle', id]);
  }
  goBack() {
    this.location.back();
  }
    goToPin(id: number) {
    this.router.navigate(['/pin/proyecto/', id]);
  }

encodeUrl(fileName: string | null): string {
  if (!fileName) return '#'; // o devuelve una URL vacía o un placeholder
  return '/files/apprcd/upload/' + encodeURIComponent(fileName);
}


}

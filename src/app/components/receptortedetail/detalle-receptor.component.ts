import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReceptorService } from '../../services/receptor.service';
import { Receptor } from '../../models/receptor.model';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-detalle-receptor',
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
  templateUrl: './detalle-receptor.component.html',
  styleUrls: ['./detalle-receptor.component.scss'],
})
export class DetalleReceptorComponent implements OnInit {
  receptor: Receptor | null = null;
  resoluciones: any[] = [];
  loading = false;
  id: number = 0;

  constructor(
    private receptorService: ReceptorService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
   this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      await this.cargarReceptor(this.id);
    }
  }

  private async cargarReceptor(id: number) {
    this.loading = true;
    try {
      const res = await this.receptorService.obtenerReceptorPorId(id);
      if (res && res.idreceptor) {
        this.receptor = Receptor.fromResponse(res);
        this.resoluciones = Array.isArray(res.resoluciones) ? res.resoluciones : [];
      } else {
        this.receptor = null;
        this.resoluciones = [];
      }
    } catch (err) {
      console.error('Error cargando receptor:', err);
      this.receptor = null;
      this.resoluciones = [];
    } finally {
      this.loading = false;
    }
  }

  agregarResolucion() {
    console.log('Navegando a agregar resolución para receptor ID:');
    // agregar redireccion al fomrulariioqu agrega resolcuion al id del receptor  path: 'receptor/:id/resolucion-create', cuanto this.id
    this.router.navigate(['/receptor', this.id, 'resolucion-create']);

    
  }
  goBack() {
    this.location.back();
  }

  goToDetalle(id: number) {
    this.router.navigate(['/resolucion-detalle', id]);
  }

    goToPin(id: number) {
    this.router.navigate(['/pin/resolucion/', id]);
  }
}

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TablaComponent } from '../shared/tabla/tabla.component';
import { SharedFooterComponent } from '../shared/shared-footer/shared-footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

type TipoEntidad = 'usuarios' | 'generador' | 'transportador' | 'receptor' | 'vehiculo' | 'resolucion' | 'proyecto' | 'visitatecnica' | 'reporte';

@Component({
  selector: 'app-lista-page',
  standalone: true,
  imports: [
    CommonModule,
    TablaComponent,
    SharedFooterComponent,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
     RouterModule,

  ],
  templateUrl: './lista-page.component.html',
  styleUrls: ['./lista-page.component.scss'],
})
export class ListaPageComponent implements OnDestroy {
  tipo: TipoEntidad = 'generador';
  private routeSub: Subscription;

  constructor(private route: ActivatedRoute) {
    // ⚡ Suscribirse a cambios de parámetros
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const param = params.get('tipo') as TipoEntidad | null;
      if (param && ['usuarios','generador', 'transportador', 'receptor', 'vehiculo', 'resolucion', 'proyecto', 'visitatecnica', 'reporte'].includes(param)) {
        this.tipo = param;
      }
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}

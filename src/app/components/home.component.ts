import { Component, OnInit, ViewChild  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../models/usuario.model';
import { SharedFooterComponent } from '../shared/shared-footer/shared-footer.component';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    BaseChartDirective,
    SharedFooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
   @ViewChild('drawer') drawer!: MatSidenav; 
  usuario: Usuario | null = null;
  rol: string = '';

  tareas = [
    { titulo: 'Inspección estructural', estado: 'Completada' },
    { titulo: 'Control eléctrico', estado: 'Pendiente' },
    { titulo: 'Revisión de planos', estado: 'En proceso' },
  ];

  recordatorio = '💡 Recuerda: cada plano bien ejecutado es una obra bien hecha.';

  barChartData = {
    labels: ['Completadas', 'Pendientes', 'En proceso', 'Bien calificadas'],
    datasets: [
      { data: [10, 7, 4, 9], label: 'Tareas', backgroundColor: '#3880ff' }
    ]
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();

    if (!this.usuario || !this.usuario.rol) {
      console.warn('[Home] Usuario o rol no disponible. Cerrando sesión...');
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.rol = this.usuario.rol;
  }

navigate(tipo: string): void {
  this.router.navigate(['/lista', tipo]); // envia el tipo como parámetro
}

navigateTo(tipo: string): void {
  this.router.navigate([`/${tipo}`]);
}
 abrirMenu() {
    this.drawer.toggle();
  }

  closeMenu() {
    this.drawer.close();
  }
 
}
import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

// Angular Material
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  usuario: Usuario | null = null;
  menuAbierto = false;

  constructor(private router: Router, private auth: AuthService) {
    this.usuario = this.auth.getUsuario();
  }

  abrirMenu(drawer: any) {
    drawer.toggle();
  }

  cerrarMenu(drawer: any) {
    drawer.close();
  }

  goTo(tipo: string, drawer: any) {
    drawer.close();
    this.router.navigate(['/lista', tipo]);
  }
  
  go(dir: string, drawer: any) {
    this.router.navigate([dir]);
    drawer.close();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

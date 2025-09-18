import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  usuario: string = '';
  clave: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  async login() {
    if (!this.usuario || !this.clave) {
      this.errorMessage = 'Usuario y clave son requeridos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      console.log('Enviando credenciales:', {
        usuario: this.usuario,
        clave: this.clave
      });

      const response = await this.auth.login({
        usuario: this.usuario,
        clave: this.clave
      });

      console.log('Respuesta del login:', response);

      if (response && response.token) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Credenciales inválidas';
      }
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      this.errorMessage = err.message || 'Error en el servidor';
    } finally {
      this.loading = false;
    }
  }
}
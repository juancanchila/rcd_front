import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment.prod';

console.log('API URL producción:', environment.API_URL);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioActual: Usuario | null = null;

  constructor(private http: HttpService) {}

async login(credentials: { usuario: string; clave: string }) {
  try {
    const response: any = await this.http
      .post(`${environment.API_URL}/auth/login`, credentials)
      .toPromise();

    this.usuarioActual = Usuario.fromLoginResponse(response);

    // Guardar en localStorage para header Authorization opcional
    localStorage.setItem('token', this.usuarioActual.token);
    localStorage.setItem('usuario', JSON.stringify(this.usuarioActual));

    return this.usuarioActual;
  } catch (err) {
    console.error('Error en AuthService login:', err);
    throw err;
  }
}


  getUsuario(): Usuario | null {
    if (this.usuarioActual) return this.usuarioActual;

    const raw = localStorage.getItem('usuario');
    if (raw) {
      const parsed = JSON.parse(raw);
      this.usuarioActual = new Usuario(
        parsed.idusuario,
        parsed.usuario,
        parsed.nombre,
        parsed.email,
        parsed.rol,
        parsed.id_rol,
        parsed.token
      );
      return this.usuarioActual;
    }

    return null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
    this.usuarioActual = null;
  }
}
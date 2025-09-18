// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.API_URL}/users`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    return new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
      'Content-Type': 'application/json',
    });
  }

  // Listar usuarios con paginación, búsqueda y ordenamiento
    async obtenerUsuarios(
    limit: number = 50,
    offset: number = 0,
    search: string = '',
    sort: string = '',
    direction: string = 'asc'
  ): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    const params = `?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`;

    try {
      const response = await this.http
        .get(`${this.baseUrl}${params}`, { headers })
        .toPromise();

      return response;
    } catch (err) {
      console.error('Error consultando usuarios:', err);
      throw err;
    }
  }

  // Obtener usuario por ID
  async obtenerUsuario(id: number): Promise<any> {
    try {
      return await this.http
        .get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
        .toPromise();
    } catch (err) {
      console.error(`Error obteniendo usuario ${id}:`, err);
      throw err;
    }
  }

  // Crear usuario
  async crearUsuario(usuario: any): Promise<any> {
    try {
      return await this.http
        .post(this.baseUrl, usuario, { headers: this.getHeaders() })
        .toPromise();
    } catch (err) {
      console.error('Error creando usuario:', err);
      throw err;
    }
  }

  // Editar usuario
  async editarUsuario(id: number, data: any): Promise<any> {
    console.log('Datos para editar usuario:', data);
    try {
      return await this.http
        .put(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() })
        .toPromise();
    } catch (err) {
      console.error(`Error editando usuario ${id}:`, err);
      throw err;
    }
  }

  // Desactivar usuario
// Cambiar estado del usuario
async cambiarEstadoUsuario(id: number, estado: string): Promise<any> {
  try {
    const body = { estado }; // aquí viaja el estado en el body

    return await this.http
      .put(
        `${this.baseUrl}/${id}`, // solo el id en la URL
        body,
        { headers: this.getHeaders() }
      )
      .toPromise();
  } catch (err) {
    console.error(`Error cambiando estado del usuario ${id}:`, err);
    throw err;
  }
}

  // Eliminar usuario
  async eliminarUsuario(id: number): Promise<any> {
    try {
      return await this.http
        .delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
        .toPromise();
    } catch (err) {
      console.error(`Error eliminando usuario ${id}:`, err);
      throw err;
    }
  }

  // Cambiar clave del usuario autenticado
  async actualizarClave(nuevaClave: string): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const body = { clave: nuevaClave };

    try {
      return await this.http
        .put(`${this.baseUrl}/${usuario.id}`, body, {
          headers: this.getHeaders(),
        })
        .toPromise();
    } catch (err) {
      console.error('Error actualizando clave:', err);
      throw err;
    }
  }

async actualizarClavePorId(idusuario: number, nuevaClave: string): Promise<any> {
  const body = { clave: nuevaClave };

  try {
    return await this.http
      .put(`${this.baseUrl}/${idusuario}`, body, {
        headers: this.getHeaders(),
      })
      .toPromise();
  } catch (err) {
    console.error('Error actualizando clave por ID:', err);
    throw err;
  }
}


}

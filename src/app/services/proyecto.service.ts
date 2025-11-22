import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ProyectoService {

  private baseUrl = `${environment.API_URL}/proyecto`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ---------------------------------------------
  // LISTAR PROYECTOS
  // ---------------------------------------------
  async obtenerProyectos(
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
    const url = `${this.baseUrl}${params}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error('Error consultando proyectos:', err);
      throw err;
    }
  }

  // ---------------------------------------------
  // OBTENER PROYECTO POR ID
  // ---------------------------------------------
  async obtenerProyectoPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();

    let headers = new HttpHeaders();
    if (usuario && usuario.token) {
      headers = headers.set('Authorization', `Bearer ${usuario.token}`);
    }

    const url = `${this.baseUrl}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando proyecto ${id}:`, err);
      throw err;
    }
  }

  // ---------------------------------------------
  // CREAR PROYECTO
  // ---------------------------------------------
  async crearProyecto(data: any): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    try {
      return await this.http.post(this.baseUrl, data, { headers }).toPromise();
    } catch (err) {
      console.error('Error creando proyecto:', err);
      throw err;
    }
  }

  // ---------------------------------------------
  // ACTUALIZAR PROYECTO
  // ---------------------------------------------
  async actualizarProyecto(id: number, data: any): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    const url = `${this.baseUrl}/${id}`;

    try {
      console.log('Actualizando proyecto con datos:', data);
      return await this.http.put(url, data, { headers }).toPromise();
    } catch (err) {
      console.error(`Error actualizando proyecto ${id}:`, err);
      throw err;
    }
  }

  // ---------------------------------------------
  // ELIMINAR PROYECTO
  // ---------------------------------------------
  async eliminarProyecto(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    const url = `${this.baseUrl}/${id}`;

    try {
      return await this.http.delete(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error eliminando proyecto ${id}:`, err);
      throw err;
    }
  }
}

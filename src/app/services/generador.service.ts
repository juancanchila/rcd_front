import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class GeneradorService {

  private baseUrl = `${environment.API_URL}/generador`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ---------------------------------------------------
  // LISTAR GENERADORES
  // ---------------------------------------------------
  async obtenerGeneradores(
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

    const params = `?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
      search
    )}&sort=${sort}&direction=${direction}`;

    try {
      const response = await this.http
        .get(`${this.baseUrl}${params}`, { headers })
        .toPromise();

      return response;
    } catch (err) {
      console.error('Error consultando generadores:', err);
      throw err;
    }
  }

  // ---------------------------------------------------
  // OBTENER GENERADOR POR ID
  // ---------------------------------------------------
  async obtenerGeneradorPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();

    let headers = new HttpHeaders();

    if (usuario && usuario.token) {
      headers = headers.set('Authorization', `Bearer ${usuario.token}`);
    }

    const url = `${this.baseUrl}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando generador ${id}:`, err);
      throw err;
    }
  }

  // ---------------------------------------------------
  // CREAR GENERADOR
  // ---------------------------------------------------
  async crearGenerador(data: any): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
      'Content-Type': 'application/json'
    });

    try {
      return await this.http.post(this.baseUrl, data, { headers }).toPromise();
    } catch (err) {
      console.error('Error creando generador:', err);
      throw err;
    }
  }

  // ---------------------------------------------------
  // ACTUALIZAR GENERADOR
  // ---------------------------------------------------
  async actualizarGenerador(id: number, data: any): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
      'Content-Type': 'application/json'
    });

    const url = `${this.baseUrl}/${id}`;

    try {
      console.log('Actualizando generador:', data);
      return await this.http.put(url, data, { headers }).toPromise();
    } catch (err) {
      console.error(`Error actualizando generador ${id}:`, err);
      throw err;
    }
  }

  // ---------------------------------------------------
  // ELIMINAR GENERADOR
  // ---------------------------------------------------
  async eliminarGenerador(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    const url = `${this.baseUrl}/${id}`;

    try {
      return await this.http.delete(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error eliminando generador ${id}:`, err);
      throw err;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ReceptorService {

  private baseUrl = `${environment.API_URL}/receptor`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // -----------------------------------------
  // HEADERS
  // -----------------------------------------
  private getHeaders(): HttpHeaders {
    const usuario = this.auth.getUsuario();
    if (!usuario || !usuario.token) {
      throw new Error('Usuario no autenticado');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
      'Content-Type': 'application/json',
    });
  }

  // -----------------------------------------
  // LISTAR
  // -----------------------------------------
  async obtenerReceptores(
    limit: number = 50,
    offset: number = 0,
    search: string = '',
    sort: string = '',
    direction: string = 'asc'
  ): Promise<any> {
    const headers = this.getHeaders();
    const params = `?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`;

    try {
      return await this.http.get(`${this.baseUrl}${params}`, { headers }).toPromise();
    } catch (err) {
      console.error('Error consultando receptores:', err);
      throw err;
    }
  }

  // -----------------------------------------
  // OBTENER POR ID
  // -----------------------------------------
  async obtenerReceptorPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    let headers = new HttpHeaders();

    if (usuario && usuario.token) {
      headers = headers.set('Authorization', `Bearer ${usuario.token}`);
    }

    const url = `${this.baseUrl}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando receptor ${id}:`, err);
      throw err;
    }
  }

  // -----------------------------------------
  // CREAR RECEPTOR
  // -----------------------------------------
  async crearReceptor(data: any): Promise<any> {
    const headers = this.getHeaders();

    try {
      console.log('Creando receptor:', data);
      return await this.http.post(this.baseUrl, data, { headers }).toPromise();
    } catch (err) {
      console.error('Error creando receptor:', err);
      throw err;
    }
  }

  // -----------------------------------------
  // ACTUALIZAR RECEPTOR
  // -----------------------------------------
  async actualizarReceptor(id: number, data: any): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${id}`;

    try {
      console.log(`Actualizando receptor ${id}:`, data);
      return await this.http.put(url, data, { headers }).toPromise();
    } catch (err) {
      console.error(`Error actualizando receptor ${id}:`, err);
      throw err;
    }
  }

  // -----------------------------------------
  // ELIMINAR RECEPTOR
  // -----------------------------------------
  async eliminarReceptor(id: number): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${id}`;

    try {
      console.log(`Eliminando receptor ${id}`);
      return await this.http.delete(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error eliminando receptor ${id}:`, err);
      throw err;
    }
  }
}

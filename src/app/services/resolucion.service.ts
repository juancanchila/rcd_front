import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ResolucionService {
  private endpoint = `${environment.API_URL}/resolucion`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // MISMA LÓGICA EXACTA: devolver headers con token si existe
  private getHeaders(): HttpHeaders {
    const usuario = this.auth.getUsuario();
    if (!usuario || !usuario.token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${usuario.token}` });
  }

  async obtenerResoluciones(
    limit: number = 50,
    offset: number = 0,
    search: string = '',
    sort: string = '',
    direction: string = 'asc'
  ): Promise<any> {
    const headers = this.getHeaders();
    const params = `?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&direction=${direction}`;
    const url = this.endpoint + params;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error('Error consultando resoluciones:', err);
      throw err;
    }
  }

  async obtenerResolucionPorId(id: number): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando resolución ${id}:`, err);
      throw err;
    }
  }

  async crearResolucion(data: any): Promise<any> {
    const headers = this.getHeaders();
    const url = this.endpoint;

    try {
      return await this.http.post(url, data, { headers }).toPromise();
    } catch (err) {
      console.error('Error creando resolución:', err);
      throw err;
    }
  }

  async actualizarResolucion(id: number, data: any): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.endpoint}/${id}`;

    try {
      console.log('Actualizando resolución con datos:', data);
      return await this.http.put(url, data, { headers }).toPromise();
    } catch (err) {
      console.error(`Error actualizando resolución ${id}:`, err);
      throw err;
    }
  }

  async eliminarResolucion(id: number): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.delete(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error eliminando resolución ${id}:`, err);
      throw err;
    }
  }
}

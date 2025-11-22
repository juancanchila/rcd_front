// src/app/services/visitatecnica.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class VisitaTecnicaService {

  private endpoint = `${environment.API_URL}/visitatecnica`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // 🔹 LISTAR VISITAS TÉCNICAS
  async obtenerVisitasTecnicas(
    limit: number = 50,
    offset: number = 0,
    search: string = '',
    sort: string = 'idvisitatecnica',
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

    const url = `${this.endpoint}${params}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error('Error consultando visitas técnicas:', err);
      throw err;
    }
  }

  // 🔹 CONSULTAR POR ID
  async obtenerVisitaTecnicasPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    let headers = new HttpHeaders();

    if (usuario && usuario.token) {
      headers = headers.set('Authorization', `Bearer ${usuario.token}`);
    }

    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando visita técnica ${id}:`, err);
      throw err;
    }
  }

  // 🔹 CREAR VISITA TÉCNICA
  async crearVisitaTecnica(data: any): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
      'Content-Type': 'application/json',
    });

    try {
      return await this.http
        .post(this.endpoint, data, { headers })
        .toPromise();
    } catch (err) {
      console.error('Error creando visita técnica:', err);
      throw err;
    }
  }

  // 🔹 ACTUALIZAR VISITA TÉCNICA
  async actualizarVisitaTecnica(id: number, data: any): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.put(url, data, { headers }).toPromise();
    } catch (err) {
      console.error(`Error actualizando visita técnica ${id}:`, err);
      throw err;
    }
  }

  // 🔹 ELIMINAR VISITA TÉCNICA
  async eliminarVisitaTecnica(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.delete(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error eliminando visita técnica ${id}:`, err);
      throw err;
    }
  }
}

// src/app/services/visitatecnica.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class VisitaTecnicaService {
  private endpoint = `${environment.API_URL}/visitatecnica`;

  constructor(private http: HttpClient, private auth: AuthService) {}

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

    const params = `?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&direction=${direction}`;
    const url = this.endpoint + params;

    try {
      const response = await this.http.get(url, { headers }).toPromise();
      return response;
    } catch (err) {
      console.error('Error consultando visitas técnicas:', err);
      throw err;
    }
  }

  async obtenerVisitaTecnicasPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    const url = `${this.endpoint}/${id}`;

    try {
      const response = await this.http.get(url, { headers }).toPromise();
      return response;
    } catch (err) {
      console.error(`Error consultando visita técnica ${id}:`, err);
      throw err;
    }
  }
}

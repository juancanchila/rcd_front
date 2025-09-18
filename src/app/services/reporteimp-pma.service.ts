import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ReporteImpPmaRcdService {
  private endpoint = `${environment.API_URL}/reportespma`;
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  async obtenerReportes(
    limit: number = 50,
    offset: number = 0,
    search: string = '',
    sort: string = '',
    direction: 'asc' | 'desc' = 'asc'
  ): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`
    });

    const params = `?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`;
    const url = this.endpoint + params;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error('Error consultando reportes IMP RCD:', err);
      throw err;
    }
  }

  async obtenerReportePorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
    if (!usuario) throw new Error('Usuario no autenticado');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`
    });

    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando reporte IMP RCD ${id}:`, err);
      throw err;
    }
  }
}
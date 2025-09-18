import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ReporteSRCDService {
  private endpoint =  `${environment.API_URL}/reportesrcd`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  async obtenerReportes(
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

    const params = `?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&direction=${direction}`;
    const url = this.endpoint + params;

    try {
      const response = await this.http.get(url, { headers }).toPromise();
      return response;
    } catch (err) {
      console.error('Error consultando reportes SRC&D:', err);
      throw err;
    }
  }

  async obtenerReportePorId(id: number): Promise<any> {
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
      console.error(`Error consultando reporte SRC&D ${id}:`, err);
      throw err;
    }
  }
}
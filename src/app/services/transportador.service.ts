import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';
@Injectable({
  providedIn: 'root',
})
export class TransportadorService {


  private baseUrl = `${environment.API_URL}/transportador`;
  constructor(private http: HttpClient, private auth: AuthService) {}

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

  async obtenerTransportadores(
    limit: number = 50,
    offset: number = 0,
    search: string = '',
    sort: string = '',
    direction: string = 'asc'
  ): Promise<any> {
    const headers = this.getHeaders();
    const params = `?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&direction=${direction}`;

    try {
      console.log('Consultando transportadores con:', { limit, offset, search, sort, direction });
      const response = await this.http
        .get(`${this.baseUrl}${params}`, { headers })
        .toPromise();

      return response;
    } catch (err) {
      console.error('Error consultando transportadores:', err);
      throw err;
    }
  }

  async obtenerTransportadorPorId(id: number): Promise<any> {
   const usuario = this.auth.getUsuario();
  
  let headers = new HttpHeaders();
  
  // Si existe usuario Y tiene token, agregar authorization
  if (usuario && usuario.token) {
    headers = headers.set('Authorization', `Bearer ${usuario.token}`);
  }
    const url = `${this.baseUrl}/${id}`;

    try {
      console.log(`Consultando transportador con ID: ${id}`);
      const response = await this.http.get(url, { headers }).toPromise();
      return response;
    } catch (err) {
      console.error(`Error consultando transportador ${id}:`, err);
      throw err;
    }
  }
}

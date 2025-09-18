import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ProyectoService {

  private baseUrl = `${environment.API_URL}/proyecto`;
  constructor(private http: HttpClient, private auth: AuthService) {}

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

    // mismo formato que en GeneradorService
    const params = `?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`;
    const url = `${this.baseUrl}${params}`;

    try {
      const response = await this.http.get(url, { headers }).toPromise();
      return response;
    } catch (err) {
      console.error('Error consultando proyectos:', err);
      throw err;
    }
  }

  async obtenerProyectoPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
   let headers = new HttpHeaders();
  
  // Si existe usuario Y tiene token, agregar authorization
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
}

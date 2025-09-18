import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private endpoint = `${environment.API_URL}/vehiculo`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  async obtenerVehiculos(
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
      console.error('Error consultando vehículos:', err);
      throw err;
    }
  }

  async obtenerVehiculoPorId(id: number): Promise<any> {
    const usuario = this.auth.getUsuario();
  let headers = new HttpHeaders();
  
  // Si existe usuario Y tiene token, agregar authorization
  if (usuario && usuario.token) {
    headers = headers.set('Authorization', `Bearer ${usuario.token}`);
  }

    const url = `${this.endpoint}/${id}`;

    try {
      const response = await this.http.get(url, { headers }).toPromise();
      return response;
    } catch (err) {
      console.error(`Error consultando vehículo ${id}:`, err);
      throw err;
    }
  }
}
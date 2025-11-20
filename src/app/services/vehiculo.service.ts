import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private endpoint = `${environment.API_URL}/vehiculo`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const usuario = this.auth.getUsuario();
    if (!usuario || !usuario.token) throw new Error('Usuario no autenticado');
    return new HttpHeaders({ Authorization: `Bearer ${usuario.token}` });
  }

  async obtenerVehiculos(
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
      console.error('Error consultando vehículos:', err);
      throw err;
    }
  }

  async obtenerVehiculoPorId(id: number): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.endpoint}/${id}`;

    try {
      return await this.http.get(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error consultando vehículo ${id}:`, err);
      throw err;
    }
  }

  async crearVehiculo(data: any): Promise<any> {
    const headers = this.getHeaders();
    try {
      return await this.http.post(this.endpoint, data, { headers }).toPromise();
    } catch (err) {
      console.error('Error creando vehículo:', err);
      throw err;
    }
  }

  async actualizarVehiculo(id: number, data: any): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.endpoint}/${id}`;
    try {
      console.log('Actualizando vehículo con datos:', data);
      return await this.http.put(url, data, { headers }).toPromise();
    } catch (err) {
      console.error(`Error actualizando vehículo ${id}:`, err);
      throw err;
    }
  }

  async eliminarVehiculo(id: number): Promise<any> {
    const headers = this.getHeaders();
    const url = `${this.endpoint}/${id}`;
    try {
      return await this.http.delete(url, { headers }).toPromise();
    } catch (err) {
      console.error(`Error eliminando vehículo ${id}:`, err);
      throw err;
    }
  }
}
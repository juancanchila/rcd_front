import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
  private baseUrl = `${environment.API_URL}/files`; // ajusta según tu ruta real

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const usuario = this.auth.getUsuario();
    if (!usuario || !usuario.token) {
      throw new Error('Usuario no autenticado');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });
  }

  async subirArchivo(file: File): Promise<any> {
    const headers = this.getHeaders();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.http
        .post(this.baseUrl, formData, { headers })
        .toPromise();
      return response;
    } catch (err) {
      console.error('Error subiendo archivo:', err);
      throw err;
    }
  }
}
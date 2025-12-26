import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

export interface ProyectoMapa {
  idProyecto: number;
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class ProyectoMapaService {

  private baseUrl = `${environment.API_URL}/map`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ---------------------------------------------
  // OBTENER PROYECTOS PARA MAPA CON LIMIT Y OFFSET
  // ---------------------------------------------
  async obtenerProyectosMapa(limit: number = 50, offset: number = 0): Promise<ProyectoMapa[]> {
    const usuario = this.auth.getUsuario();
    if (!usuario || !usuario.token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${usuario.token}`,
    });

    try {
      const url = `${this.baseUrl}?limit=${limit}&offset=${offset}`;
      const res: any = await this.http.get(url, { headers }).toPromise();

      // Filtrar y convertir a float solo coordenadas válidas
      const proyectosMapa: ProyectoMapa[] = res.data
        .map((proyecto: any) => {
          let lat = parseFloat(proyecto.CoordenadaX);
          let lng = parseFloat(proyecto.CoordenadaY);

          // Corregir lat/lng invertidos si lat fuera de rango
          if (lat < -90 || lat > 90) [lat, lng] = [lng, lat];

          return { idProyecto: proyecto.idProyecto, lat, lng };
        })
        .filter((p: { lat: number; lng: number }) =>
          !isNaN(p.lat) && !isNaN(p.lng) &&
          p.lat >= -90 && p.lat <= 90 &&
          p.lng >= -180 && p.lng <= 180
        );

      return proyectosMapa;

    } catch (err) {
      console.error('Error obteniendo proyectos para mapa:', err);
      throw err;
    }
  }
}

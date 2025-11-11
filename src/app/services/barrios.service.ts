import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BarriosService {
  constructor(private http: HttpClient) {}

  /**
   * Carga los barrios desde un archivo JSON local ubicado en assets/.
   * Ejemplo: assets/localidad1.json
   * @param localidadId Número o string del ID de localidad (por ejemplo "233")
   */
  async obtenerBarrios(localidadId: string): Promise<string[]> {
    try {
      // Ruta del archivo según la localidad seleccionada
      const ruta = `assets/localidad${localidadId}.json`;

      // Leer archivo (es un array de objetos con "name")
      const data = await firstValueFrom(this.http.get<any[]>(ruta));

      // Extraer solo los nombres
      const barrios = data.map((item) => item.name);

      return barrios;
    } catch (error) {
      console.error(`Error al cargar los barrios de la localidad ${localidadId}:`, error);
      return [];
    }
  }
}

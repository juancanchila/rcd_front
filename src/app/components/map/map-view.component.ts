import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ProyectoMapaService, ProyectoMapa } from '../../services/map.service';

@Component({
  selector: 'map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements AfterViewInit {

  locations: ProyectoMapa[] = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private markers: L.Marker[] = [];

  // Paginação
  limit = 20;
  offset = 0;

  constructor(private proyectoMapaService: ProyectoMapaService) {}

  async ngAfterViewInit(): Promise<void> {
    await this.waitForContainer();

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: false
    }).setView([10.39972, -75.51444], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 30
    }).addTo(this.map);

    await this.loadProyectos();
    this.renderMarkers();
    this.map.invalidateSize();
  }

  // Cargar proyectos con paginación
  private async loadProyectos(): Promise<void> {
    try {
      const proyectos = await this.proyectoMapaService.obtenerProyectosMapa(this.limit, this.offset);

      this.locations = proyectos
        .map(p => {
          let lat = parseFloat(p.lat as any);
          let lng = parseFloat(p.lng as any);

          // Corregir lat/lng invertidos
          if (lat < -90 || lat > 90) [lat, lng] = [lng, lat];

          return { idProyecto: p.idProyecto, lat, lng };
        })
        .filter(p =>
          Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
          p.lat >= -90 && p.lat <= 90 &&
          p.lng >= -180 && p.lng <= 180
        );

      console.log(`Markers válidos (offset=${this.offset}):`, this.locations);

    } catch (err) {
      console.error('Error cargando proyectos para el mapa:', err);
    }
  }

  private renderMarkers(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    if (!this.locations.length) return;

    const bounds = L.latLngBounds([]);
    this.locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng])
        .addTo(this.map)
        .bindPopup(`Proyecto ID: ${loc.idProyecto}`);
      this.markers.push(marker);
      bounds.extend([loc.lat, loc.lng]);
    });

    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [30, 30] });
  }

  // Botón siguiente
  async siguiente(): Promise<void> {
    this.offset += this.limit;
    await this.loadProyectos();
    this.renderMarkers();
  }

  // Botón anterior
  async anterior(): Promise<void> {
    this.offset = Math.max(0, this.offset - this.limit);
    await this.loadProyectos();
    this.renderMarkers();
  }

  private waitForContainer(): Promise<void> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (this.mapContainer.nativeElement.offsetHeight > 0) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import * as L from 'leaflet';

@Component({
  selector: 'map-picker',
  standalone: true,
  imports: [CommonModule, MatInputModule],
  templateUrl: './map-picker.component.html',
  styleUrls: ['./map-picker.component.scss']
})
export class MapPickerComponent implements AfterViewInit {
  @Input() lat = 10.39972;
  @Input() lng = -75.51444;
  @Output() coordinates = new EventEmitter<{ latitude: number; longitude: number }>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker!: L.Marker;

  async ngAfterViewInit(): Promise<void> {
    await this.waitForContainer();

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: false
    }).setView([this.lat, this.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 30,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    const defaultIcon = L.icon({
      iconUrl: 'assets/marker.svg',
      shadowUrl: 'assets/shadow.svg',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41]
    });

    this.marker = L.marker([this.lat, this.lng], { draggable: true, icon: defaultIcon }).addTo(this.map);

    // Eventos del mapa y marcador
    this.marker.on('dragend', () => this.emitMarkerPosition());
    this.map.on('click', (e: L.LeafletMouseEvent) => this.updateMarker(e.latlng));

    this.map.invalidateSize();
  }

  private emitMarkerPosition(): void {
    const pos = this.marker.getLatLng();
    this.lat = +pos.lat.toFixed(6);
    this.lng = +pos.lng.toFixed(6);

    this.coordinates.emit({
      latitude: this.lat,
      longitude: this.lng
    });
  }

  private updateMarker(latlng: L.LatLng): void {
    this.marker.setLatLng(latlng);
    this.lat = +latlng.lat.toFixed(6);
    this.lng = +latlng.lng.toFixed(6);

    this.coordinates.emit({
      latitude: this.lat,
      longitude: this.lng
    });
  }

  // Cuando el usuario escribe latitud
  onLatChange(event: any): void {
    const newLat = parseFloat(event.target.value);
    if (isFinite(newLat)) {
      this.lat = newLat;
      this.updateMapFromInputs();
    }
  }

  // Cuando el usuario escribe longitud
  onLngChange(event: any): void {
    const newLng = parseFloat(event.target.value);
    if (isFinite(newLng)) {
      this.lng = newLng;
      this.updateMapFromInputs();
    }
  }

  // Actualizar marcador desde los inputs
  private updateMapFromInputs(): void {
    if (!this.map || !this.marker) return;

    const newLatLng = L.latLng(this.lat, this.lng);

    this.marker.setLatLng(newLatLng);
    this.map.setView(newLatLng, this.map.getZoom());

    this.coordinates.emit({
      latitude: this.lat,
      longitude: this.lng
    });
  }

  // Espera a que el contenedor esté visible
  private waitForContainer(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.mapContainer?.nativeElement?.offsetHeight > 0) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }
}

// pines-vigentes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-pines-vigentes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    SharedFooterComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './pines-vigentes.component.html',
  styleUrls: ['./pines-vigentes.component.css']
})
export class PinesVigentesComponent implements OnInit {
  pines = [
    {
      titulo: 'Generador',
      imagen: 'assets/generador.jpg',
      ruta: '/lista/generador'
    },
    {
      titulo: 'Transportador',
      imagen: 'assets/Transportador.jpg',
      ruta: '/lista/transportador'
    },
    {
      titulo: 'Receptor',
      imagen: 'assets/Receptor.jpg',
      ruta: '/lista/receptor'
    }
  ];

  // Objeto para rastrear si las imágenes han cargado
  imagesLoaded: { [key: string]: boolean } = {
    'generador': false,
    'transportador': false,
    'receptor': false
  };

  constructor(private router: Router) { }

  ngOnInit() {
    // Precargar imágenes
    this.preloadImages();
  }

  preloadImages() {
    this.pines.forEach(pin => {
      const img = new Image();
      img.src = pin.imagen;
      img.onload = () => {
        this.imagesLoaded[pin.titulo.toLowerCase()] = true;
      };
      img.onerror = () => {
        this.imagesLoaded[pin.titulo.toLowerCase()] = false;
      };
    });
  }

  imageLoaded(titulo: string): boolean {
    return this.imagesLoaded[titulo.toLowerCase()];
  }

  navigate(ruta: string) {
    this.router.navigate([ruta]);
  }
}
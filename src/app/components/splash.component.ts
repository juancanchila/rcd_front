import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-splash',
  standalone: true,  // ← Añadido
  imports: [CommonModule, MatProgressSpinnerModule],  // ← Añadidos imports necesarios
  templateUrl: './splash.component.html',  // ← Corregido .component.html
  styleUrls: ['./splash.component.css']  // ← Corregido a styleUrls (plural)
})
export class SplashComponent implements OnInit {  // ← Mejor nombre SplashComponent

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 5000); // 5 segundos
  }
}
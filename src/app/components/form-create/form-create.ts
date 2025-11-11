import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { FormHostComponent } from '../form-host/form-host.component';

@Component({
  selector: 'app-form-create',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    FormHostComponent
  ],
  templateUrl: './form-create.html',
  styleUrl: './form-create.css'
})
export class FormCreate {
  tipo!: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      const param = params.get('tipo');
      if (param) {
        console.log('Tipo parameter:', param);
        this.tipo = param;
      } else {
        this.router.navigate(['/lista']);
      }
    });
  }
}
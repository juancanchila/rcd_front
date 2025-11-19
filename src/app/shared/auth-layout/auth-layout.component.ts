// src/app/components/auth-layout/auth-layout.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../alert/toast.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {}

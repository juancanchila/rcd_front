// perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SharedFooterComponent } from '../shared/shared-footer/shared-footer.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Usuario } from '../models/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    SharedFooterComponent
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  passwordForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();

    // Formulario reactivo para cambiar contraseña
    this.passwordForm = this.fb.group({
      nuevaClave: ['', [Validators.required, Validators.minLength(8)]],
      repetirClave: ['', Validators.required]
    });
  }

  async actualizarClave() {
    if (!this.passwordForm.valid) return;

    const { nuevaClave, repetirClave } = this.passwordForm.value;

    if (nuevaClave !== repetirClave) {
      alert('Las claves no coinciden');
      return;
    }

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongRegex.test(nuevaClave)) {
      alert('Clave débil. Usa mayúsculas, minúsculas, dígitos y símbolos');
      return;
    }

    try {
      await this.userService.actualizarClave(nuevaClave);
      alert('Clave actualizada correctamente');
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error actualizando clave:', err);
      alert('Error al actualizar la clave');
    }
  }
}

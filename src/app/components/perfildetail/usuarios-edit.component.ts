import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { User } from '../../models/user.model';
import { Rol } from '../../models/rol.model';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { SharedFooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'app-usuarios-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SharedFooterComponent
  ],
  templateUrl: './usuarios-edit.component.html',
  styleUrls: ['./usuarios-edit.component.scss']
})
export class UsuariosEditComponent implements OnInit {
  user: User | null = null;
  roles: Rol[] = [];
  loading = false;

  infoForm!: FormGroup;
  passwordForm!: FormGroup;
  estadoForm!: FormGroup;

  constructor(
    private roleService: RoleService,
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.roles = await this.cargarRoles();

    if (id) {
      await this.cargarUsuario(id);
    }
  }

  async cargarRoles(): Promise<Rol[]> {
    try {
      return await this.roleService.getRoles().toPromise() || [];
    } catch (err) {
      console.error('Error cargando roles:', err);
      return [];
    }
  }

  async cargarUsuario(id: number) {
    this.loading = true;
    try {
      const res = await this.userService.obtenerUsuario(id);

      if (res && res.idusuario) {
        this.user = User.fromResponse(res);

        this.infoForm = this.fb.group({
          nombre: [this.user.nombre, Validators.required],
          usuario: [this.user.usuario, Validators.required],
          email: [this.user.email, [Validators.required, Validators.email]],
          rol: [this.user.rol, Validators.required]
        });

        this.passwordForm = this.fb.group({
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required]
        });

        this.estadoForm = this.fb.group({
          estado: [this.user.estado, Validators.required]
        });
      }
    } catch (err) {
      console.error('Error cargando usuario:', err);
    } finally {
      this.loading = false;
    }
  }

  async guardarInfo() {
    if (this.infoForm.valid && this.user) {
      const selectedRol = this.roles.find(
        r => r.rol === this.infoForm.value.rol
      );

      try {
        const updated: any = {
          idusuario: this.user.id,
          nombre: this.infoForm.value.nombre,
          usuario: this.infoForm.value.usuario,
          email: this.infoForm.value.email,
          estado: this.user.estado,
          id_rol: selectedRol ? selectedRol.id_rol : this.user.id_rol
        };

        await this.userService.editarUsuario(this.user.id, updated);
        alert('Información actualizada correctamente');
      } catch (err) {
        console.error('Error actualizando info:', err);
      }
    }
  }

  async cambiarPassword() {
    if (this.passwordForm.valid && this.user) {
      const { password, confirmPassword } = this.passwordForm.value;
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      try {
        await this.userService.actualizarClavePorId(this.user.id, password);
        alert('Contraseña actualizada correctamente');
        this.passwordForm.reset();
      } catch (err) {
        console.error('Error cambiando contraseña:', err);
      }
    }
  }

  async cambiarEstado() {
    if (this.estadoForm.valid && this.user) {
      try {
        await this.userService.cambiarEstadoUsuario(
          this.user.id,
          this.estadoForm.value.estado
        );
        alert('Estado actualizado correctamente');
      } catch (err) {
        console.error('Error cambiando estado:', err);
      }
    }
  }

  goBack() {
    this.location.back();
  }
}

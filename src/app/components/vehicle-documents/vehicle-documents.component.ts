import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'vehicle-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './vehicle-documents.component.html',
  styleUrls: ['./vehicle-documents.component.css'],
})
export class VehicleDocumentsComponent implements OnInit {
  @Input() group!: FormGroup;

  tipoSolicitante$: Observable<string> | undefined;

  ngOnInit(): void {
    const tipoCtrl = this.group.get('tipo_de_solicitante');
    if (tipoCtrl) {
      // Observable que emite cada vez que cambia el tipo de solicitante
      this.tipoSolicitante$ = tipoCtrl.valueChanges.pipe(startWith(tipoCtrl.value));
    }
  }

  // Función para saber si un control es inválido
  isInvalid(controlName: string): boolean {
    const ctrl = this.group.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  // Función para saber si un control es requerido
  isRequired(controlName: string): boolean {
    const ctrl = this.group.get(controlName);
    if (!ctrl) return false;
    return this.hasRequiredValidator(ctrl);
  }

  private hasRequiredValidator(ctrl: AbstractControl): boolean {
    if (!ctrl || !ctrl.validator) return false;
    const validator = ctrl.validator({} as AbstractControl);
    return validator ? !!validator['required'] : false;
  }
}

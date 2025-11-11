import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'vehicle-documents',
  standalone: true,
   imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './vehicle-documents.component.html',
  styleUrls: ['./vehicle-documents.component.css'] 
})
export class VehicleDocumentsComponent {
  @Input() group!: FormGroup;
  // dentro de la clase del componente
isInvalid(controlName: string): boolean {
  const ctrl = this.group.get(controlName);
  return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
}

isRequired(controlName: string): boolean {
  const ctrl = this.group.get(controlName);
  if (!ctrl) return false;
  const validator = ctrl.validator ? ctrl.validator({} as any) : null;
  // alternativa segura: revisamos el control en la definición del grupo (si tienes acceso)
  // pero en la mayoría de casos es suficiente comprobar si tiene error 'required' después de touched
  return ctrl.hasValidator ? ctrl.hasValidator(Validators.required) : false;
}
}
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'personal-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-documents.component.html',
  styleUrls: ['./personal-documents.component.css']
})
export class PersonalDocuments implements OnInit {
  @Input() group!: FormGroup;
  @Input() tipoSolicitante!: string; // "Persona Natural" o "Persona Jurídica"

  ngOnInit() {
    console.log('📄 Tipo de solicitante detectado:', this.tipoSolicitante);

    // 🔧 Controlar visibilidad de campos según el tipo
    if (this.tipoSolicitante === 'Persona Natural') {
      this.group.get('identificacion_persona')?.enable();
      this.group.get('certificado_existencia')?.disable();
    } else if (this.tipoSolicitante === 'Persona Jurídica') {
      this.group.get('identificacion_persona')?.disable();
      this.group.get('certificado_existencia')?.enable();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.group.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isRequired(controlName: string): boolean {
    const control = this.group.get(controlName);
    if (!control || !control.validator) return false;
    const validator = control.validator({} as any);
    return !!(validator && validator['required']);
  }
}

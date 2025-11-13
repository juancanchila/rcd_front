import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'generator-general-documents',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './generator-general-documents.component.html',
  styleUrl: './generator-general-documents.component.css',
})
export class GeneratorGeneralDocumentsComponent implements OnInit {
  @Input() group!: FormGroup;

  ngOnInit() {
    console.log('📂 Inicializando documentos del proyecto');
  }

  // ✅ Método para validar si un campo es inválido
  isInvalid(controlName: string): boolean {
    const control = this.group.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // ✅ Método para saber si un campo es requerido
  isRequired(controlName: string): boolean {
    const control = this.group.get(controlName);
    if (!control || !control.validator) return false;
    const validator = control.validator({} as any);
    return !!(validator && validator['required']);
  }
}

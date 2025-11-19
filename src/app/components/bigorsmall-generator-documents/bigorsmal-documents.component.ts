import { Component, Input, OnInit } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bigorsmall-documents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './bigorsmal-documents.component.html',
  styleUrls: ['./bigorsmal-documents.component.css'],
})
export class BigOrSmallGeneratorDocuments implements OnInit {
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

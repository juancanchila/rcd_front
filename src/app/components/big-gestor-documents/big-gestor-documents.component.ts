import { Component } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'big-gestor-documents',
imports: [
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatOptionModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatNativeDateModule,
],  standalone: true,
  templateUrl: './big-gestor-documents.component.html',
  styleUrl: './big-gestor-documents.component.css'
})
export class BigGestorDocuments {

}

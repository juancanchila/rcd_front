import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'summary-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './summary-data.component.html',
  styleUrls: ['./summary-data.component.css'],
})
export class SummaryDataComponent {
  @Input() form!: FormGroup;
  @Input() tipo!: string;

  getUploadedDocuments(): string[] {
    const docs = this.form.get('vehiculodocuments')?.value || {};
    return Object.keys(docs)
      .filter((key) => docs[key])
      .map((key) => `${key.replace(/_/g, ' ')}: ✅`);
  }
}

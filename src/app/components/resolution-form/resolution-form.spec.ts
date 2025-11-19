import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolutionForm } from './resolution-form';

describe('ResolutionForm', () => {
  let component: ResolutionForm;
  let fixture: ComponentFixture<ResolutionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolutionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolutionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

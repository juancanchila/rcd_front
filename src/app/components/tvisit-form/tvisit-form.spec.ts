import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvisitForm } from './tvisit-form';

describe('TvisitForm', () => {
  let component: TvisitForm;
  let fixture: ComponentFixture<TvisitForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TvisitForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TvisitForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

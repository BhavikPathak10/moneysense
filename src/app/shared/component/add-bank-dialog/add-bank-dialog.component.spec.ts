import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBankDialogComponent } from './add-bank-dialog.component';

describe('AddBankDialogComponent', () => {
  let component: AddBankDialogComponent;
  let fixture: ComponentFixture<AddBankDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBankDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBankDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeAtGlanceComponent } from './income-at-glance.component';

describe('IncomeAtGlanceComponent', () => {
  let component: IncomeAtGlanceComponent;
  let fixture: ComponentFixture<IncomeAtGlanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeAtGlanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeAtGlanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

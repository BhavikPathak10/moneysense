import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerCalendarComponent } from './planner-calendar.component';

describe('PlannerCalendarComponent', () => {
  let component: PlannerCalendarComponent;
  let fixture: ComponentFixture<PlannerCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

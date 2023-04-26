import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPlannerDetailsComponent } from './confirm-planner-details.component';

describe('ConfirmPlannerDetailsComponent', () => {
  let component: ConfirmPlannerDetailsComponent;
  let fixture: ComponentFixture<ConfirmPlannerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmPlannerDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPlannerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

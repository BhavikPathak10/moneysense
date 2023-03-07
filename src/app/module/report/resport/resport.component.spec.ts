import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResportComponent } from './resport.component';

describe('ResportComponent', () => {
  let component: ResportComponent;
  let fixture: ComponentFixture<ResportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

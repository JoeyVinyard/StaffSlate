import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileEmployeeTableComponent } from './mobile-employee-table.component';

describe('MobileEmployeeTableComponent', () => {
  let component: MobileEmployeeTableComponent;
  let fixture: ComponentFixture<MobileEmployeeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileEmployeeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileEmployeeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

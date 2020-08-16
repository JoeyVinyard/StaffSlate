import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopEmployeeTableComponent } from './desktop-employee-table.component';

describe('DesktopEmployeeTableComponent', () => {
  let component: DesktopEmployeeTableComponent;
  let fixture: ComponentFixture<DesktopEmployeeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopEmployeeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopEmployeeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

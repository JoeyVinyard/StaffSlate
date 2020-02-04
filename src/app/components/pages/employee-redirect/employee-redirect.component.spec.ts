import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRedirectComponent } from './employee-redirect.component';

describe('EmployeeRedirectComponent', () => {
  let component: EmployeeRedirectComponent;
  let fixture: ComponentFixture<EmployeeRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

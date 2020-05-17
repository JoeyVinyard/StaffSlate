import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEmployeeConfirmationComponent } from './delete-employee-confirmation.component';

describe('DeleteEmployeeConfirmationComponent', () => {
  let component: DeleteEmployeeConfirmationComponent;
  let fixture: ComponentFixture<DeleteEmployeeConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteEmployeeConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteEmployeeConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

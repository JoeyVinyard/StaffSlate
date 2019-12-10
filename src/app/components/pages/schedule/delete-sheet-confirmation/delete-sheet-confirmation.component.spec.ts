import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSheetConfirmationComponent } from './delete-sheet-confirmation.component';

describe('DeleteSheetConfirmationComponent', () => {
  let component: DeleteSheetConfirmationComponent;
  let fixture: ComponentFixture<DeleteSheetConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSheetConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSheetConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

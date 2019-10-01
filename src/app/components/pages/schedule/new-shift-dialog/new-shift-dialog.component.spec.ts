import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewShiftDialogComponent } from './new-shift-dialog.component';

describe('NewShiftDialogComponent', () => {
  let component: NewShiftDialogComponent;
  let fixture: ComponentFixture<NewShiftDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewShiftDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewShiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

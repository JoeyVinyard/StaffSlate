import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewScheduleDialogComponent } from './new-schedule-dialog.component';

describe('NewScheduleDialogComponent', () => {
  let component: NewScheduleDialogComponent;
  let fixture: ComponentFixture<NewScheduleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewScheduleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewScheduleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

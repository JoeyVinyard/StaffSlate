import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewManagerDialogComponent } from './new-manager-dialog.component';

describe('NewManagerDialogComponent', () => {
  let component: NewManagerDialogComponent;
  let fixture: ComponentFixture<NewManagerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewManagerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewManagerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

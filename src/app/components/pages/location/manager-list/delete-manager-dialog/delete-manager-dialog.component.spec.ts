import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteManagerDialogComponent } from './delete-manager-dialog.component';

describe('DeleteManagerDialogComponent', () => {
  let component: DeleteManagerDialogComponent;
  let fixture: ComponentFixture<DeleteManagerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteManagerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteManagerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

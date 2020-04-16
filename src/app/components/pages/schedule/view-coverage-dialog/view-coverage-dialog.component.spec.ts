import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCoverageDialogComponent } from './view-coverage-dialog.component';

describe('ViewCoverageDialogComponent', () => {
  let component: ViewCoverageDialogComponent;
  let fixture: ComponentFixture<ViewCoverageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCoverageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCoverageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

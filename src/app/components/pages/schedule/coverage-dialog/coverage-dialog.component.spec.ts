import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageDialogComponent } from './coverage-dialog.component';

describe('CoverageDialogComponent', () => {
  let component: CoverageDialogComponent;
  let fixture: ComponentFixture<CoverageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

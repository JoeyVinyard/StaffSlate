import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetPromptDialogComponent } from './sheet-prompt-dialog.component';

describe('SheetPromptDialogComponent', () => {
  let component: SheetPromptDialogComponent;
  let fixture: ComponentFixture<SheetPromptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetPromptDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetPromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConfirmRedirectComponent } from './email-confirm-redirect.component';

describe('EmailConfirmRedirectComponent', () => {
  let component: EmailConfirmRedirectComponent;
  let fixture: ComponentFixture<EmailConfirmRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailConfirmRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailConfirmRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {

  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);

  loginError: string;

  getEmailError(): string {
    if(this.email.hasError("required")) {
      return "Email is required";
    } else if (this.email.hasError("email")) {
      return "Not a valid email";
    } else {
      return "";
    }
  }

  getPasswordError(): string {
    if(this.password.hasError("required")) {
      return "Password is required";
    } else {
      return "";
    }
  }

  enter(event: KeyboardEvent) {
    if(event.keyCode == 13) {
      this.login();
    }
  }

  login(): void {
    if(this.email.invalid || this.password.invalid) {
      this.loginError = "Please enter valid login details.";
      return;
    } else {
      this.af.auth.signInWithEmailAndPassword(this.email.value, this.password.value).then(() => {
        this.router.navigateByUrl("dashboard");
      }).catch((err) => {
        this.loginError = "Error logging in. Username or Password may be incorrect."
      })
    }
  }

  ngOnDestroy() {
    this.title.setTitle("PicoStaff");
  }

  constructor(private af: AngularFireAuth, private router: Router, private title: Title){
    this.title.setTitle("PicoStaff | Login");
  }

}

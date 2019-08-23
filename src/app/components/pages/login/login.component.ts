import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);

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

}

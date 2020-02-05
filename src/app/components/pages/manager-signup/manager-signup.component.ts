import { Component } from '@angular/core';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { PasswordValidator } from 'src/app/validators/password-validator';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-manager-signup',
  templateUrl: './manager-signup.component.html',
  styleUrls: ['./manager-signup.component.css']
})
export class ManagerSignupComponent {

  private email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  private firstName: FormControl = new FormControl('', [Validators.required]);
  private lastName: FormControl = new FormControl('', [Validators.required]);
  private password: FormControl = new FormControl('', [Validators.required, PasswordValidator.strong]);
  private conf_password: FormControl = new FormControl('', [Validators.required, (control: AbstractControl) => {
    if(this.password.value != control.value) {
      return {mismatch: true};
    }
    return null;
  }]);

  private getEmailError() {
    if(this.email.hasError("required")) {
      return "Email is required";
    } else if(this.email.hasError("email")) {
      return "Email not valid"
    } else {
      return "";
    }
  }
  private getFirstNameError() {
    if(this.firstName.hasError("required")) {
      return "Please provide your name";
    } else {
      return "";
    }
  }
  private getLastNameError() {
    if(this.lastName.hasError("required")) {
      return "Please provide your name";
    } else {
      return "";
    }
  }
  private getPasswordError() {
    if(this.password.hasError("required")) {
      return "Please provide a password";
    } else if(this.password.hasError("tooShort")) {
      return "Password must be at least 8 characters long!"
    } else if(this.password.hasError("needsNumber")) {
      return "Password must have at least one number!"
    } else if(this.password.hasError("needsUpper")) {
      return "Password must have at least one uppercase letter!"
    } else if(this.password.hasError("needsLower")) {
      return "Password must have at least one number!"
    } else {
      return "";
    }
  }
  private getConfPasswordError() {
    if(this.conf_password.hasError("required")) {
      return "Please provide a password";
    } else if(this.conf_password.hasError("mismatch")) {
      return "Passwords do not match!"
    } else {
      return "";
    }
  }
  private getRegisterError() {}

  private register() {
    this.userService.register({
      email: this.email.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value
    }, this.password.value).then(() => {
      this.router.navigateByUrl("/confirm");
    }).catch((err) => {
      console.error(err);
    })
  }

  constructor(private userService: UserService, private afa: AngularFireAuth, private router: Router) { }
}
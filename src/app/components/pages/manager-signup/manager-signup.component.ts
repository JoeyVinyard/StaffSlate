import { Component } from '@angular/core';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { PasswordValidator } from 'src/app/validators/password-validator';
import { UserService } from 'src/app/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-manager-signup',
  templateUrl: './manager-signup.component.html',
  styleUrls: ['./manager-signup.component.css']
})
export class ManagerSignupComponent {

  public registerError: string = "";

  public email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public firstName: FormControl = new FormControl('', [Validators.required]);
  public lastName: FormControl = new FormControl('', [Validators.required]);
  public password: FormControl = new FormControl('', [Validators.required, PasswordValidator.strong]);
  public conf_password: FormControl = new FormControl('', [Validators.required, (control: AbstractControl) => {
    if(this.password.value != control.value) {
      return {mismatch: true};
    }
    return null;
  }]);

  public getEmailError() {
    if(this.email.hasError("required")) {
      return "Email is required";
    } else if(this.email.hasError("email")) {
      return "Email not valid"
    } else {
      return "";
    }
  }
  public getFirstNameError() {
    if(this.firstName.hasError("required")) {
      return "Please provide your name";
    } else {
      return "";
    }
  }
  public getLastNameError() {
    if(this.lastName.hasError("required")) {
      return "Please provide your name";
    } else {
      return "";
    }
  }
  public getPasswordError() {
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
  public getConfPasswordError() {
    if(this.conf_password.hasError("required")) {
      return "Please provide a password";
    } else if(this.conf_password.hasError("mismatch")) {
      return "Passwords do not match!"
    } else {
      return "";
    }
  }

  public enter(event: KeyboardEvent) {
    if(event.keyCode == 13) {
      this.register();
    }
  }

  public register() {
    if(this.email.invalid || this.firstName.invalid || this.lastName.invalid || this.password.invalid || this.conf_password.invalid) {
      this.registerError = "Please enter valid details.";
      return;
    }
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

  constructor(private userService: UserService, private afa: AngularFireAuth, private router: Router, private route: ActivatedRoute, private title: Title) {
    this.title.setTitle("PicoStaff | Business Management Made Easy");
    route.paramMap.subscribe((params) => {
      if(params.has("email")) {
        this.email.setValue(params.get("email"));
        this.email.disable();
      }
    });
  }
}

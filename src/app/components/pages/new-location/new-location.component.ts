import { Component, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';
import { FormControl, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-new-location',
  templateUrl: './new-location.component.html',
  styleUrls: ['./new-location.component.css']
})
export class NewLocationComponent implements AfterViewInit {

  private name = new FormControl('', [Validators.required]);
  private address = new FormControl('', [Validators.required]);
  private city = new FormControl('', [Validators.required]);
  private state = new FormControl('AK', [Validators.required]);
  private zip = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]);

  private states = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];
  private createError = "";

  private getNameError(): string {
    if(this.name.hasError("required")) {
      return "Please enter a name"
    } else {
      return "";
    }
  }

  private getAddressError(): string {
    if(this.address.hasError("required")) {
      return "Please enter a valid address"
    } else {
      return "";
    }
  }

  private getCityError(): string {
    if(this.city.hasError("required")) {
      return "Please enter a valid city"
    } else {
      return "";
    }
  }

  private getStateError(): string {
    if(this.state.hasError("required")) {
      return "Please enter a valid city"
    } else {
      return "";
    }
  }

  private getZipError(): string {
    if(this.zip.hasError("required") || this.zip.hasError("minlength") || this.zip.hasError("maxlength")) {
      return "Please enter a valid city"
    } else {
      return "";
    }
  }

  private create(): void {
    this.locationService.createLocation({
      label: this.name.value,
      address: this.address.value,
      city: this.city.value,
      state: this.state.value,
      zip: this.zip.value,
      managers: [this.afa.auth.currentUser.email],
      schedules: []
    }).then(() => {
      this.createError = "";
      this.router.navigateByUrl("/dashboard");
    }).catch((err) => {
      console.error(err);
      this.createError = "Error creating location, please try again shortly."
    })
  }

  constructor(private afa: AngularFireAuth, private locationService: LocationService, private router: Router, private dialog: MatDialog) { }

  ngAfterViewInit() {
    this.dialog.open(WelcomeDialogComponent);
  }

}

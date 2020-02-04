import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-email-confirm-redirect',
  templateUrl: './email-confirm-redirect.component.html',
  styleUrls: ['./email-confirm-redirect.component.css']
})
export class EmailConfirmRedirectComponent {

  private confirmationMessage: string = "";

  resend(): void {
    this.afa.auth.currentUser.sendEmailVerification().then(() => {
      this.confirmationMessage = "Confirmation email succesfully sent!";
    }).catch((err) => {
      if(err.code == "auth/too-many-requests") {
        this.confirmationMessage = "Please wait a minute or two before requesting another confirmation :)";
      } else {
        this.confirmationMessage = "Error sending confirmation email, please try again later!";
      }
    });
  }

  constructor(private afa: AngularFireAuth, private userService: UserService) { }

}

import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-email-confirm-redirect',
  templateUrl: './email-confirm-redirect.component.html',
  styleUrls: ['./email-confirm-redirect.component.css']
})
export class EmailConfirmRedirectComponent {

  constructor(private userService: UserService) { }

}

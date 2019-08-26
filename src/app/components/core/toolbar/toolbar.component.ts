import { Component, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  @Output() toggled = new EventEmitter();

  private logout(): void {
    this.userService.logout().then(() => {
      this.router.navigateByUrl("login");
    }).catch((err) => {
      console.error(err);
    });
  }

  constructor(public af: AngularFireAuth, private userService: UserService, private router: Router) {}

}

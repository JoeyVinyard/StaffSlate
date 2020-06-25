import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {

  @ViewChild('sidenav') sidenav: MatSidenav;

  toggle() {
    this.sidenav.toggle();
  }

  navigate(link: string) {
    this.router.navigateByUrl(link);
    this.sidenav.close();
  }

  constructor(private router: Router){}
}

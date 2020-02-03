import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { UserInfo } from '../models/user-info';

@Injectable({
  providedIn: 'root'
})
export class ConfirmEmailGuard implements CanActivate {

  private sub: Subscription;

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise<boolean | UrlTree>((res,rej) => {
      this.sub = this.userService.getCurrentUserInfo().subscribe((userInfo: UserInfo) => {
        let outlet: any;
        if(!userInfo) {
          outlet = this.router.parseUrl("/login");
        }else if(userInfo.confirmed) {
          if(next.url[0].path == "confirm") {
            outlet = this.router.parseUrl("/dashboard");
          }
          outlet = true;
        } else {
          if(next.url[0].path != "confirm") {
            outlet = this.router.parseUrl("/confirm")
          } else {
            outlet = true;
          }
        }
        res(outlet);
      });
    });
    this.sub.unsubscribe();
  }
  
  constructor(private userService: UserService, private router: Router) {}
}

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class ConfirmEmailGuard implements CanActivate {

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise<boolean | UrlTree>((res,rej) => {
      this.afa.user.pipe(first()).subscribe((user: User) => {
        let outlet: any;
        if(!user) {
          outlet = this.router.parseUrl("/login");
        }else if(user.emailVerified) {
          if(next.url[0].path == "confirm") {
            outlet = this.router.parseUrl("/dashboard");
          } else {
            outlet = true;
          }
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
  }
  
  constructor(private afa: AngularFireAuth, private router: Router) {}
}

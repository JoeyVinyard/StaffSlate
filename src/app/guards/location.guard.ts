import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree   {
      return this.userService.userCanAccessLocation(next.paramMap.get("scheduleId")).then((hasAccess) => {
        if(hasAccess) {
          return true;
        } else {
          return this.router.parseUrl("/dashboard");
        }
      })
  }
  constructor(private router: Router, private userService: UserService) {}
}

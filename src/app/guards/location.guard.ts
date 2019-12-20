import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree   {
      return new Promise<boolean | UrlTree>((res, rej) => {
        this.userService.userCanAccessLocation(next.paramMap.get("locationId")).then((hasAccess) => {
          if(hasAccess) {
            res(true);
          } else {
            if (next.paramMap.has("viewId")) {
              this.locationService.loadLocation(next.paramMap.get("locationId")).subscribe((location) => {
                location.loadScheduleData(next.paramMap.get("scheduleId")).subscribe((schedule) => {
                  res(schedule.viewId == next.paramMap.get("viewId") || this.router.parseUrl("/dashboard"));
                });
              });
            } else {
              res(this.router.parseUrl("/dashboard"));
            }
          }
        });
      });
  }
  constructor(private router: Router, private userService: UserService, private locationService: LocationService) {}
}

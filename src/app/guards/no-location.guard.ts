import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocationService } from '../services/location.service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoLocationGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise((res, rej) => {
      this.locationService.getLocationsMap().pipe(first()).subscribe((locationMap) => {
        if(next.url[0].path == "new-location") {
          if(locationMap.size != 0) {
            res(this.router.parseUrl("/dashboard"));
          } else {
            res(true);
          }
        } else {
          if(locationMap.size == 0) {
            res(this.router.parseUrl("/new-location"));
          } else {
            res(true);
          }
        }
        // if(locationMap.size == 0 && next.url[0].path != "new-location") {
        //   res(this.router.parseUrl("/new-location"));
        // } else {
        //   if(next.url[0].path == "new-location") {
        //     res(this.router.parseUrl("/dashboard"));
        //   } else {
        //     console.log("Ressing true");
        //     res(true);
        //   }
        // }
      })
    });
  }
  
  constructor(private locationService: LocationService, private router: Router) {}

}

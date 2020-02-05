import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocationService } from '../services/location.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { Schedule } from '../models/schedule';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree   {
      return new Promise<boolean | UrlTree>((res, rej) => {
        let user = this.afa.auth.currentUser;
        let locationId = next.paramMap.get("locationId");
        let scheduleId = next.paramMap.get("scheduleId");
        let viewId = next.paramMap.get("viewId");
        
        if(!viewId) {
          if(user) {
            this.afs.collection("locations").doc(locationId).get().subscribe((value: DocumentSnapshot<Location>) => {
              if(value.data().managers.includes(user.email)) {
                res(true);
              } else {
                res(this.router.parseUrl("/dashboard"));
              }
            });
          } else {
            res(this.router.parseUrl("/dashboard"));
          }
        } else {
          this.afs.collection("locations").doc(locationId).collection("schedules").doc(scheduleId).get().subscribe((value: DocumentSnapshot<Schedule>) => {
            if(value.data().viewId == viewId) {
              res(true);
            } else {
              res(this.router.parseUrl("/dashboard"));
            }
          });
        }
      });
  }
  constructor(private router: Router, private afa: AngularFireAuth, private afs: AngularFirestore, private locationService: LocationService) {}
}

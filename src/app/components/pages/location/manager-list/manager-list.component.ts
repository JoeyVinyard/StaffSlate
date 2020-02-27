import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { UserService } from 'src/app/services/user.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { UserInfo } from 'src/app/models/user-info';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-manager-list',
  templateUrl: './manager-list.component.html',
  styleUrls: ['./manager-list.component.css']
})
export class ManagerListComponent implements OnDestroy {
  
  locationSub: Subscription;
  subscriptions: Subscription[] = [];
  managers: UserInfo[] = [];
  
  public parseName(mInfo: UserInfo): string {
    return `${mInfo.firstName} ${mInfo.lastName}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  constructor(public locationService: LocationService, public userService: UserService) {
    this.locationSub = locationService.getCurrentLocation().subscribe((location: Location) => {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.managers = [];
      location.managers.map((manager:string) => {
        this.subscriptions.push(this.userService.loadUserInfoFromEmail(manager).subscribe((mInfo) => {
          this.managers.push(mInfo);
        }));
      });
    });
  }

}

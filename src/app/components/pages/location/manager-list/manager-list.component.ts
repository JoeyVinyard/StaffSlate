import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { UserInfo } from 'src/app/models/user-info';
import { Location } from 'src/app/models/location';
import { MatDialog } from '@angular/material';
import { NewManagerDialogComponent } from './new-manager-dialog/new-manager-dialog.component';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-manager-list',
  templateUrl: './manager-list.component.html',
  styleUrls: ['./manager-list.component.css']
})
export class ManagerListComponent implements OnDestroy {
  
  curLocation: Location;
  locationSub: Subscription;
  subscriptions: Subscription[] = [];
  managers: UserInfo[] = [];
  
  public openNewManagerDialog() {
    this.dialog.open(NewManagerDialogComponent, {width: "350px"}).afterClosed().subscribe((email: string) => {
      this.aff.functions.httpsCallable("inviteManager")({
        email: email,
        locationId: this.curLocation.document.ref.id
      }).then((result) => {
        console.log(result);
      }).catch((err) => {
        console.error(err);
      });
    });
  }

  public parseName(mInfo: UserInfo): string {
    return `${mInfo.firstName} ${mInfo.lastName}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  constructor(public locationService: LocationService, public userService: UserService, public dialog: MatDialog, private aff: AngularFireFunctions) {
    this.locationSub = locationService.getCurrentLocation().subscribe((location: Location) => {
      this.curLocation = location;
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

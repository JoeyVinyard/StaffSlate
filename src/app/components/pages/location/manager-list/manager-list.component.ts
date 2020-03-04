import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { UserInfo } from 'src/app/models/user-info';
import { Location } from 'src/app/models/location';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewManagerDialogComponent } from './new-manager-dialog/new-manager-dialog.component';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireAuth } from '@angular/fire/auth';
import { DeleteManagerDialogComponent } from './delete-manager-dialog/delete-manager-dialog.component';

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
      if(email) {
        if(this.curLocation.managers.includes(email)) {
          this.snackbar.open("Email already has access to location", "Dismiss", {duration: 3000});
        } else {
          let ref = this.snackbar.open("Adding Manager...", "Dismiss", {duration: 2000});
          this.aff.functions.httpsCallable("inviteManager")({
            email: email,
            locationId: this.curLocation.document.ref.id
          }).then((result) => {
            ref.dismiss();
            this.snackbar.open("Manager successfully added", "Dismiss", {duration: 3000});
            console.log(result);
          }).catch((err) => {
            ref.dismiss();
            this.snackbar.open("Failed to add Manager", "Dismiss", {duration: 3000});
            console.error(err);
          });
        }
      }
    });
  }

  public delete(mInfo: UserInfo): void {
    this.dialog.open(DeleteManagerDialogComponent, {width: "350px", data: mInfo.email}).afterClosed().subscribe((confirm: boolean) => {
      if(confirm) {
          let ref = this.snackbar.open("Deleting Manager...", "Dismiss", {duration: 2000});
          this.aff.functions.httpsCallable("removeManager")({
          email: mInfo.email,
          locationId: this.curLocation.document.ref.id
        }).then(() => {
          ref.dismiss();
          this.snackbar.open("Manager successfully removed.", "Dismiss", {duration: 3000});
        }).catch(() => {
          ref.dismiss();
          this.snackbar.open("Failed to remove manager.", "Dismiss", {duration: 3000});
        })
      }
    });
  }

  public parseName(mInfo: UserInfo): string {
    return mInfo.firstName ? `${mInfo.firstName} ${mInfo.lastName}` : mInfo.email;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  constructor(
    public afa: AngularFireAuth,
    public locationService: LocationService,
    public userService: UserService,
    private aff: AngularFireFunctions,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.locationSub = locationService.getCurrentLocation().subscribe((location: Location) => {
      let update = !(this.curLocation && JSON.stringify(this.curLocation.managers) == JSON.stringify(location.managers));
      this.curLocation = location;
      if(update) {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.managers = [];
        location.managers.map((manager:string) => {
          this.userService.loadUserInfoFromEmail(manager).subscribe((mInfo) => {
            this.managers.push(mInfo || {email: manager, firstName: null, lastName: null});
          });
        });
      }
    });
  }

}

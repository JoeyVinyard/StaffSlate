import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Schedule } from 'src/app/models/schedule';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { NewScheduleDialogComponent } from './new-schedule-dialog/new-schedule-dialog.component';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UserInfo } from 'src/app/models/user-info';
import { Subscription } from 'rxjs';
import { Identifier } from 'src/app/models/identifier';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent implements OnDestroy {

  dataSource = new MatTableDataSource<Identifier>();
  displayedColumns: string[] = ['name', 'action'];
  private loadedLocation: Location;
  private subscriptions: Subscription[] = [];

  private openSchedule(schedule: Identifier) {
    this.router.navigate(["schedule", this.loadedLocation.document.ref.id, schedule.key]);
  }
  
  private openNewScheduleDialog(schedule: Identifier = null): void {
    const dialogRef = this.dialog.open(NewScheduleDialogComponent, {
      width: '300px',
      data: schedule
    });
    this.subscriptions.push(dialogRef.afterClosed().subscribe((newSchedule: Schedule) => {
      if (newSchedule) {
        if(schedule) {
          let i = this.loadedLocation.schedules.findIndex(s => s.key == schedule.key);
          this.loadedLocation.schedules[i].display = newSchedule.label;
          this.loadedLocation.document.update({schedules: this.loadedLocation.schedules});
        } else {
          newSchedule.sheets = []
          this.loadedLocation.addSchedule(newSchedule)
            .then(() => this.addScheduleResult(true))
            .catch((err) => {
              console.error(err);
              this.addScheduleResult(false);
            });
        }
      }
    }));
  }

  private addScheduleResult(success: boolean): void {
    if (success) {
      this.snackbar.open("Schedule succesfully created.", "Dismiss", {
        duration: 5000
      });
    } else {
      this.snackbar.open("Error creating schedule, please try again later.", "Dismiss", {
        duration: 5000
      });
    }
  }

  private delete(schedule: Schedule): void {
    this.loadedLocation.deleteSchedule(schedule.label).then(() => {
      this.snackbar.open("Schedule succesfully deleted.", "Dismiss", {
        duration: 5000
      });
    }).catch(() => {
      this.snackbar.open("Error deleting schedule, please try again later.", "Dismiss", {
        duration: 5000
      });
    })
  }

  private filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  constructor(private locationService: LocationService, private userService: UserService, public dialog: MatDialog, public snackbar: MatSnackBar, private router: Router) {
    this.snackbar.open("Loading Schedules...", "Dismiss");
    this.subscriptions.push(this.userService.getCurrentUserInfo().subscribe((userInfo: UserInfo) => {
      this.subscriptions.push(this.locationService.loadLocation(userInfo.locations[0].key).subscribe((location: Location) => {
        this.loadedLocation = location;
        this.dataSource.data = location.schedules;
        this.snackbar.dismiss();
      }));
    }));
  }
}

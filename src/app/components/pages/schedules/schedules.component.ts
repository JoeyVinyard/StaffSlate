import { Component, OnDestroy, Input, OnInit, ViewChild } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Schedule } from 'src/app/models/schedule';
import { MatTableDataSource, MatDialog, MatSnackBar, MatPaginator } from '@angular/material';
import { NewScheduleDialogComponent } from './new-schedule-dialog/new-schedule-dialog.component';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { Identifier } from 'src/app/models/identifier';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent implements OnInit, OnDestroy {

  @Input() inline: boolean = false;

  dataSource = new MatTableDataSource<Identifier>();
  displayedColumns: string[] = ['name', 'action'];
  private loadedLocation: Location;
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  public openSchedule(schedule: Identifier) {
    this.router.navigate(["schedule", this.loadedLocation.document.ref.id, schedule.key]);
  }

  public openNewScheduleDialog(schedule: Identifier = null): void {
    const dialogRef = this.dialog.open(NewScheduleDialogComponent, {
      width: '300px',
      data: schedule
    });
    dialogRef.afterClosed().subscribe((newSchedule: Schedule) => {
      if (newSchedule) {
        if(schedule) {
          this.loadedLocation.document.collection("schedules").doc(schedule.key).update(newSchedule);
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
    });
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

  public delete(schedule: string): void {
    this.loadedLocation.deleteSchedule(schedule).then(() => {
      this.snackbar.open("Schedule succesfully deleted.", "Dismiss", {
        duration: 5000
      });
    }).catch((err) => {
      this.snackbar.open("Error deleting schedule, please try again later.", "Dismiss", {
        duration: 5000
      });
    })
  }

  public filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  public buttonContent(): string {
    return `New ${window.innerWidth > 800 && !this.inline ? "Schedule" : ""}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private locationService: LocationService, private userService: UserService, public dialog: MatDialog, public snackbar: MatSnackBar, private router: Router) {
    this.snackbar.open("Loading Schedules...", "Dismiss");
    let schedulesSub: Subscription;
    this.subscriptions.push(this.locationService.getCurrentLocation().subscribe((location: Location) => {
      if(schedulesSub) {
        schedulesSub.unsubscribe();
      }
      schedulesSub = location.getSchedules().subscribe((schedules) => {
        this.dataSource.data = Array.from(schedules.entries()).map((s: [string, Schedule]) => {
          return {key: s[0], display: s[1].label} as Identifier;
        });
      })
      this.loadedLocation = location;
      this.snackbar.dismiss();
    }));
  }
}

import { Component } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Schedule } from 'src/app/models/schedule';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { NewScheduleDialogComponent } from './new-schedule-dialog/new-schedule-dialog.component';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent {

  dataSource = new MatTableDataSource<Schedule>();
  displayedColumns: string[] = ['name', 'action'];
  private loadedLocation: Location;


  private openSchedule(schedule: Schedule) {
      this.router.navigate(["schedule", schedule.id]);
  }
  
  private openNewScheduleDialog(): void {
    const dialogRef = this.dialog.open(NewScheduleDialogComponent, {
      width: '300px',
    });
    dialogRef.afterClosed().subscribe((schedule: Schedule) => {
      if (schedule) {
        schedule.sheetOrder = [];
        this.loadedLocation.addSchedule(schedule)
          .then(() => this.addScheduleResult(true))
          .catch((err) => {
            console.error(err);
            this.addScheduleResult(false);
          });
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

  private delete(schedule: Schedule): void {
    this.loadedLocation.deleteSchedule(schedule.id).then(() => {
      this.snackbar.open("Schedule succesfully deleted.", "Dismiss", {
        duration: 5000
      });
    }).catch(() => {
      this.snackbar.open("Error deleting schedule, please try again later.", "Dismiss", {
        duration: 5000
      });
    })
  }

  private parseSchedules(schedules: Schedule[]): void {
    this.dataSource.data = schedules;
    this.snackbar.dismiss();
  }
  
  private filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  constructor(private locationService: LocationService, private userService: UserService, public dialog: MatDialog, public snackbar: MatSnackBar, private router: Router) {
    this.snackbar.open("Loading Schedules...", "Dismiss");
    this.locationService.currentLocation.subscribe((location: Location) => {
      this.loadedLocation = location;
      this.loadedLocation.loadSchedules().subscribe(this.parseSchedules.bind(this));
    });
  }
}

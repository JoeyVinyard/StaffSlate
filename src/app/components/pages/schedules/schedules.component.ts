import { Component } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { DisplayedSchedule, Schedule } from 'src/app/models/schedule';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { NewScheduleDialogComponent } from './new-schedule-dialog/new-schedule-dialog.component';
import { Router } from '@angular/router';
import { Sheet } from 'src/app/models/sheet';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent {

  dataSource = new MatTableDataSource<DisplayedSchedule>();
  displayedColumns: string[] = ['name', 'action'];


  private openSchedule(schedule: DisplayedSchedule) {
    this.locationService.getCurrentLocationKey().subscribe((key) => {
      this.router.navigate(["schedule", key, schedule.id]);
    }).unsubscribe();
  }
  
  private openNewScheduleDialog(): void {
    const dialogRef = this.dialog.open(NewScheduleDialogComponent, {
      width: '300px',
    });
    dialogRef.afterClosed().subscribe((schedule: Schedule) => {
      if (schedule) {
        this.locationService.addScheduleToCurrentLocation(schedule)
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

  private delete(schedule: DisplayedSchedule): void {
    this.locationService.deleteScheduleFromCurrentLocation(schedule.id).then(() => {
      this.snackbar.open("Schedule succesfully deleted.", "Dismiss", {
        duration: 5000
      });
    }).catch(() => {
      this.snackbar.open("Error deleting schedule, please try again later.", "Dismiss", {
        duration: 5000
      });
    })
  }

  private parseSchedules(location: Location): void {
    if(location) {
      this.dataSource.data =  Array.from(location.schedules).map((schedule) => {
        return {
          label: schedule[1].label,
          sheets: schedule[1].sheets,
          id: schedule[0]
        } as DisplayedSchedule
      });
      this.snackbar.dismiss();
    }
  }
  
  private filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  constructor(private locationService: LocationService, public dialog: MatDialog, public snackbar: MatSnackBar, private router: Router) {
    this.snackbar.open("Loading Schedules...", "Dismiss");
    this.locationService.getCurrentLocation().subscribe(this.parseSchedules.bind(this));
  }
}

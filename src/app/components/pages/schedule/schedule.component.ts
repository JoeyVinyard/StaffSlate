import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from 'src/app/models/schedule';
import { Location } from 'src/app/models/location';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Sheet } from 'src/app/models/sheet';
import { LocationService } from 'src/app/services/location.service';
import { Employee } from 'src/app/models/employee';
import { Shift } from 'src/app/models/shift';
import { MatDialog } from '@angular/material';
import { NewShiftDialogComponent } from './new-shift-dialog/new-shift-dialog.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  
  private currentSchedule: Schedule;
  private sheets: Sheet[];
  private currentLocation: Location;
  
  private times: number[] = [];
  
  private openNewShiftDialog(): void {
    const dialogRef = this.dialog.open(NewShiftDialogComponent, {
      width: '400px',
    });
    // dialogRef.afterClosed().subscribe((employee: Employee) => {
    //   if (employee) {
    //     this.loadedLocation.addEmployee(employee)
    //       .then(() => this.addEmployeeResult(true))
    //       .catch(() => this.addEmployeeResult(false));
    //   }
    // });
  }

  private isInShift(time: number, shift: Shift): boolean {
    return (time >= shift.startTime && time < shift.endTime);
  }
  
  private formatTime(time: number): string {
    if(time == 0)  {
      return "12am"
    } else if(time < 12) {
      return time + "am";
    } else if(time == 12) {
      return "12pm";
    } else {
      return time%12 + "pm";
    }
  }
  
  parseSchedule(): void {
    this.currentSchedule.loadSheets().subscribe((sheets) => {
      this.sheets = sheets;
    });
  }
  
  parseName(emp: Employee) {
    return `${emp.firstName} ${emp.lastName.substring(0,1)}.`;
  }
  
  constructor(
    private locationService: LocationService,
    private scheduleService: ScheduleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog) {
    activatedRoute.paramMap.subscribe((map) => {
      
      locationService.currentLocation.subscribe((location) => {
        this.currentLocation = location;
        let scheduleId = map.get("scheduleId");
        this.scheduleService.loadSchedule(scheduleId).subscribe((schedule) => {
          this.currentSchedule = schedule;
          this.parseSchedule();
        });
      });
    });
    
    
    //debug
    for(let i = 7; i < 21; i++) {
      this.times.push(i);
    }
  }
}

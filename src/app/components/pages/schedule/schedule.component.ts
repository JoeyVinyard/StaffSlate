import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from 'src/app/models/schedule';
import { Location } from 'src/app/models/location';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Sheet } from 'src/app/models/sheet';
import { LocationService } from 'src/app/services/location.service';
import { Employee } from 'src/app/models/employee';
import { Shift } from 'src/app/models/shift';

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
    this.parseShifts();
  });
}

  parseShifts(): void {
    this.sheets.forEach((sheet) => {
      sheet.shifts.forEach((shift: Shift) => {
        this.currentLocation.fetchEmployee(shift.empId).subscribe((empData: Employee) => {
          shift.employeeName = empData.firstName + " " + empData.lastName.substring(0, 1) + ".";
        });
      });
    });
  }
  
  constructor(private locationService: LocationService, private scheduleService: ScheduleService, private activatedRoute: ActivatedRoute, private router: Router) {
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

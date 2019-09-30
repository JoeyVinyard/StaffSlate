import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from 'src/app/models/schedule';
import { Location } from 'src/app/models/location';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Sheet } from 'src/app/models/sheet';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {

  private currentSchedule: Schedule;
  private sheets: Sheet[];

  private times: string[] = [];

  constructor(private scheduleService: ScheduleService, private activatedRoute: ActivatedRoute, private router: Router) {
    activatedRoute.paramMap.subscribe((map) => {
      let scheduleId = map.get("scheduleId");
      this.scheduleService.loadSchedule(scheduleId);
      this.scheduleService.currentSchedule.subscribe((schedule) => {
        this.currentSchedule = schedule;
        this.currentSchedule.loadSheets().subscribe((sheets) => {
          this.sheets = sheets;
          console.log(this.sheets);
        });
      });
    });
    for(let i = 7; i < 21; i++) {
      this.times.push(i + ":00");
    }
  }
}

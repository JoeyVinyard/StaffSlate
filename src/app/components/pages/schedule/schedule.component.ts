import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Schedule } from 'src/app/models/schedule';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {

  private currentSchedule: Schedule;

  constructor(private locationService: LocationService, private activatedRoute: ActivatedRoute) {
  //   activatedRoute.paramMap.subscribe((map) => {
  //     let locationId = map.get("locationId");
  //     let scheduleId = map.get("scheduleId");
  //     locationService.getLocations().subscribe((locations: Map<string, Location>) => {
  //       if(locations){
  //         this.currentSchedule = <any>locations.get(locationId).schedules.get(scheduleId);
  //         this.currentSchedule.id = scheduleId;
  //         // if(!this.currentSchedule.sheets) {
  //         //   this.currentSchedule.sheets = new Map();
  //         // }
  //         console.log(this.currentSchedule);
  //       }
  //     });
  //   });
  }
}

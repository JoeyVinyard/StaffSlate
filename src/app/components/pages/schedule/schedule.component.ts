import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private loadedLocation: Location;

  constructor(private locationService: LocationService, private activatedRoute: ActivatedRoute, private router: Router) {
    activatedRoute.paramMap.subscribe((map) => {
      let scheduleId = map.get("scheduleId");
      this.locationService.currentLocation.subscribe((location) => {
        this.loadedLocation = location;
        this.loadedLocation.loadSchedule(scheduleId).subscribe((schedule) => {
          if(!schedule) {
            router.navigateByUrl("schedules");
          }
          this.currentSchedule = schedule;
        });
      });
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent implements OnDestroy {

  private alive: Subject<boolean> = new Subject<boolean>();
  public locations: [string, Location][];
  public selectedLocation: string;

  public select(locationId: string): void {
    this.userService.setLastAccessedLocation(locationId);
    this.locationService.loadLocation(locationId)
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(private locationService: LocationService, private userService: UserService) {
    this.userService.getCurrentUserInfo().pipe(takeUntil(this.alive)).subscribe((userData) => {
      this.selectedLocation = userData.lastAccessed;
    });
    this.locationService.getLocationsMap().pipe(takeUntil(this.alive)).subscribe((locationMap) => {
      this.locations = Array.from(locationMap.entries());
    });
  }

}

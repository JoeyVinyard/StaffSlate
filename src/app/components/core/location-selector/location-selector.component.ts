import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent {

  locations: [string, Location][];

  constructor(public locationService: LocationService) {
    this.locationService.getLocationsMap().subscribe((locationMap) => {
      this.locations = Array.from(locationMap.entries());
    });
  }

}

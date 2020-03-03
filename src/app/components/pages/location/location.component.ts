import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {

  constructor(private route: ActivatedRoute, public locationService: LocationService) {
    route.params.subscribe((params) => {
      const locationId = params.locationId;
      locationService.loadLocation(locationId);
      
    });
  }

  ngOnInit() {
  }

}

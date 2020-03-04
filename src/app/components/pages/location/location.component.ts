import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from 'src/app/models/location';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnDestroy {

  public curLocation: Location;
  private sub: Subscription;

  public formatAddress(): string {
    if(this.curLocation) {
      return `${this.curLocation.address}`;
    }
    return "";
  }

  constructor(private route: ActivatedRoute, public locationService: LocationService) {
    route.params.subscribe((params) => {
      const locationId = params.locationId;
      this.sub = locationService.loadLocation(locationId).subscribe((location) => {
        this.curLocation = location;
      });
    });
  }

  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }

}

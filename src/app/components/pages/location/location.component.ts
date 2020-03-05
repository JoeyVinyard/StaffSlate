import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from 'src/app/models/location';
import { Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnDestroy {

  public editingLabel: boolean = false;
  public editingAddress: boolean = false;
  public curLocation: Location;
  private sub: Subscription;

  public label = new FormControl('', [Validators.required]);

  public saveLabel(): void {
    this.editingLabel = false;
    this.curLocation.document.update({label: this.label.value}).then(() => {
      this.snackbar.open("Location Name successfully updated!", "Dismiss", {duration: 2000});
    }).catch((err) => {
      this.snackbar.open("Failed to update Location Name!", "Dismiss", {duration: 2000});
    });
  }

  constructor(private route: ActivatedRoute, public locationService: LocationService, private snackbar: MatSnackBar) {
    route.params.subscribe((params) => {
      const locationId = params.locationId;
      this.sub = locationService.loadLocation(locationId).subscribe((location) => {
        this.curLocation = location;
        this.label.setValue(location.label);
      });
    });
  }

  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }

}

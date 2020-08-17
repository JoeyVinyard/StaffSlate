import { Component, OnDestroy } from "@angular/core";
import { LocationService } from "src/app/services/location.service";
import { ActivatedRoute } from "@angular/router";
import { Location } from "src/app/models/location";
import { FormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { switchMap, takeWhile, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
    selector: "app-location",
    templateUrl: "./location.component.html",
    styleUrls: ["./location.component.css"],
})
export class LocationComponent implements OnDestroy {
    public editing: boolean = false;
    public curLocation: Location;
    private alive: Subject<boolean> = new Subject<boolean>();

    public label = new FormControl("", [Validators.required]);
    public address = new FormControl("", [Validators.required]);
    public city = new FormControl("", [Validators.required]);
    public state = new FormControl("", [Validators.required]);
    public zip = new FormControl("", [Validators.required]);

    public editLocation(): void {
        this.editing = true;
    }

    public saveLocation(): void {
        this.editing = false;
        this.curLocation.document
            .update({
                label: this.label.value,
                address: this.address.value,
                city: this.city.value,
                state: this.state.value,
                zip: this.zip.value,
            })
            .then(() => {
                this.snackbar.open("Location Name successfully updated!", "Dismiss", {
                    duration: 2000,
                });
            })
            .catch((err) => {
                this.snackbar.open("Failed to update Location Name!", "Dismiss", {
                    duration: 2000,
                });
            });
    }

    public getAddress(): string {
        return `${this.curLocation.address}, ${this.curLocation.city} ${this.curLocation.state}, ${this.curLocation.zip}`;
    }

    constructor(
        private route: ActivatedRoute,
        public locationService: LocationService,
        private snackbar: MatSnackBar
    ) {
        route.params
            .pipe(
                switchMap((params) => locationService.loadLocation(params.locationId)),
                takeUntil(this.alive)
            )
            .subscribe((location) => {
                this.curLocation = location;
                this.label.setValue(location.label);
                this.address.setValue(location.address);
                this.city.setValue(location.city);
                this.state.setValue(location.state);
                this.zip.setValue(location.zip);
            });
    }

    ngOnDestroy() {
        this.alive.next(true);
    }
}

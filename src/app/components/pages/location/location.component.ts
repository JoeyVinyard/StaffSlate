import { Component, OnDestroy } from "@angular/core";
import { LocationService } from "src/app/services/location.service";
import { ActivatedRoute } from "@angular/router";
import { Location } from "src/app/models/location";
import { switchMap, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
    selector: "app-location",
    templateUrl: "./location.component.html",
    styleUrls: ["./location.component.css"],
})
export class LocationComponent implements OnDestroy {
    public curLocation: Location;
    private alive: Subject<boolean> = new Subject<boolean>();

    public getAddress(): string {
        return `${this.curLocation.address}, ${this.curLocation.city} ${this.curLocation.state}, ${this.curLocation.zip}`;
    }

    constructor(private route: ActivatedRoute, public locationService: LocationService) {
        route.params
            .pipe(
                switchMap((params) => locationService.loadLocation(params.locationId)),
                takeUntil(this.alive)
            )
            .subscribe((location) => {
                this.curLocation = location;
            });
    }

    ngOnDestroy() {
        this.alive.next(true);
    }
}

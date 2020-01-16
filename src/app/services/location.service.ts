import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Subscription, ReplaySubject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private currentLocationSub: Subscription;
    private cachedLocations: Map<string, Location> = new Map<string, Location>();
    public currentLocation: ReplaySubject<Location> = new ReplaySubject(1);
    public currentLocationKey: string = "";

    public loadLocation(locationId: string): ReplaySubject<Location> {
        if(this.currentLocationSub) {
            this.currentLocationSub.unsubscribe();
        }
        this.currentLocationKey = locationId;
        if(this.cachedLocations.has(locationId)){
            this.currentLocation.next(this.cachedLocations.get(locationId));
        } else {
            this.currentLocationSub = this.afs.collection("locations").doc<Location>(locationId).valueChanges().subscribe((locationData: Location) => {
                let location: Location = new Location(locationData, this.afs.collection("locations").doc<Location>(locationId))
                this.currentLocation.next(location);
                this.cachedLocations.set(locationId, location);
            });
        }
        return this.currentLocation;
    }

    constructor(private afs: AngularFirestore, private userService: UserService) {
        userService.getCurrentUserInfo().subscribe((userInfo: UserInfo) => {
            if(userInfo.locations.length > 0) {
                this.currentLocationKey = userInfo.locations[0].key;
                this.loadLocation(this.currentLocationKey);
            }
        });
    }
}

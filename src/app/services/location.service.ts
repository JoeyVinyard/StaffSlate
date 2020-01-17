import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { ReplaySubject, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private cachedLocations: Map<string, Location> = new Map<string, Location>();
    private currentLocation: ReplaySubject<Location> = new ReplaySubject(1);

    public getCurrentLocation(): Observable<Location> {
        return this.currentLocation;
    }

    public loadLocation(locationId: string): ReplaySubject<Location> {
        if(this.cachedLocations.has(locationId)){
            this.currentLocation.next(this.cachedLocations.get(locationId));
        } else {
            this.afs.collection("locations").doc<Location>(locationId).valueChanges().subscribe((locationData: Location) => {
                let location: Location = new Location(locationData, this.afs.collection("locations").doc<Location>(locationId))
                this.currentLocation.next(location);
                this.cachedLocations.set(locationId, location);
            });
        }
        return this.currentLocation;
    }

    constructor(private afs: AngularFirestore) {}
}

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Subscription, ReplaySubject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private currentLocationSub: Subscription;
    public currentLocation: ReplaySubject<Location> = new ReplaySubject(1);
    public currentLocationKey:string = "";

    public loadLocation(locationId: string): void {
        if(this.currentLocationSub) {
            this.currentLocationSub.unsubscribe();
        }
        this.currentLocationSub = this.afs.collection("locations").doc<Location>(locationId).valueChanges().subscribe((locationData: Location) => {
            this.currentLocation.next(new Location(this.afs.collection("locations").doc<Location>(locationId)));
        });
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

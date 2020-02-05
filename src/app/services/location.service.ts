import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChange } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { ReplaySubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { UserInfo } from '../models/user-info';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private cachedLocations: Map<string, Location> = new Map<string, Location>();
    private currentLocation: ReplaySubject<Location> = new ReplaySubject(1);
    private cachedLocationsSubject: ReplaySubject<Map<string, Location>> = new ReplaySubject(1);

    public getCurrentLocation(): Observable<Location> {
        return this.currentLocation;
    }

    public getLocationsMap(): Observable<Map<string, Location>> {
        return this.cachedLocationsSubject;
    }

    public loadLocation(locationId: string): ReplaySubject<Location> {
        this.currentLocation.next(this.cachedLocations.get(locationId));
        return this.currentLocation;
    }

    private loadAccessibleLocations(email: string) {
        let locationsCollection = this.afs.collection("locations").ref;
        locationsCollection.where("managers", "array-contains", email).onSnapshot((querySnapshot) => {
            querySnapshot.docChanges().forEach((changedDoc: DocumentChange<Location>) => {
                this.cachedLocations.set(changedDoc.doc.id, new Location(changedDoc.doc.data(),
                                            this.afs.collection("locations").doc<Location>(changedDoc.doc.id)));
                this.cachedLocationsSubject.next(this.cachedLocations);
            });
            this.currentLocation.next(this.cachedLocations.values().next().value);
        });
    }

    constructor(private afs: AngularFirestore, private userService: UserService) {
        this.userService.getCurrentUserInfo().subscribe((userInfo: UserInfo) => {
            if(userInfo) {
                this.loadAccessibleLocations(userInfo.email);
            }
        })
    }
}

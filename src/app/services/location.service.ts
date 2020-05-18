import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChange, DocumentReference } from '@angular/fire/firestore';
import { Location, NewLocation } from '../models/location';
import { ReplaySubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { UserInfo } from '../models/user-info';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private lastUser: string;
    private accessedLocationsSub;
    private cachedLocations: Map<string, Location> = new Map<string, Location>();
    private currentLocation: ReplaySubject<Location> = new ReplaySubject(1);
    private cachedLocationsSubject: ReplaySubject<Map<string, Location>> = new ReplaySubject(1);

    public createLocation(location: NewLocation): Promise<DocumentReference> {
        return this.afs.collection("locations").add(location);
    }

    public getCurrentLocation(): Observable<Location> {
        return this.currentLocation;
    }

    public getLocationsMap(): Observable<Map<string, Location>> {
        return this.cachedLocationsSubject;
    }

    public loadLocation(locationId: string): ReplaySubject<Location> {
        if(!this.cachedLocations.has(locationId)) {
            this.afs.collection("locations").doc<Location>(locationId).snapshotChanges().subscribe((location) => {
                this.cachedLocations.set(locationId, new Location(location.payload.data(), this.afs.collection("locations").doc<Location>(location.payload.id)));
                this.currentLocation.next(this.cachedLocations.get(locationId));
            });
        } else {
            this.currentLocation.next(this.cachedLocations.get(locationId));
        }
        return this.currentLocation;
    }

    private loadAccessibleLocations(email: string) {
        if(this.accessedLocationsSub) {
            this.accessedLocationsSub();
        }
        this.accessedLocationsSub = this.afs.collection("locations").ref.where("managers", "array-contains", email).onSnapshot((querySnapshot) => {
            querySnapshot.docChanges().forEach((changedDoc: DocumentChange<Location>) => {
                if(changedDoc.doc.exists) {
                    this.cachedLocations.set(changedDoc.doc.id, new Location(changedDoc.doc.data(), this.afs.collection("locations").doc<Location>(changedDoc.doc.id)));
                } else {
                    this.cachedLocations.delete(changedDoc.doc.id);
                }
            });
            this.cachedLocationsSubject.next(this.cachedLocations);
            this.currentLocation.next(this.cachedLocations.values().next().value);
        });
    }

    constructor(private afs: AngularFirestore, private userService: UserService) {
        this.userService.getCurrentUserInfo().subscribe((userInfo: UserInfo) => {
            if(userInfo) {
                if(userInfo.email != this.lastUser) {
                    this.loadAccessibleLocations(userInfo.email);
                    this.lastUser = userInfo.email;
                }
            }
        })
    }
}

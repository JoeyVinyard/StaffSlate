import { Injectable, EventEmitter } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Employee } from '../models/employee';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private locationsCollection:AngularFirestoreCollection<Location> = this.afs.collection("locations");
    private locations: Map<string, Location> = new Map();
    private currentLocation: Location = null;
    private currentLocationKey: string = null;
    public status: EventEmitter<void> = new EventEmitter();
    
    getLocations(): Map<string, Location> {
        return this.locations;
    }
    
    getCurrentLocationKey(): string {
        return this.currentLocationKey
    }
    
    getCurrentLocation(): Location {
        return this.currentLocation;
    }
    
    setCurrentLocation(key: string): void {
        this.currentLocation = this.locations.get(key);
        this.currentLocationKey = key;
    }
    
    loadLocations(userInfo: UserInfo): void {
        this.locations.clear();
        let locationFetchStatus: Promise<void>[] = [];
        locationFetchStatus.push(new Promise((res, rej) => {
            userInfo.locations.forEach((location) => {
                this.locationsCollection.doc<Location>(location).valueChanges().subscribe((locationData) => {
                    locationData.employees = new Map();
                    this.afs.collection<Employee>(`locations/${location}/employees`).snapshotChanges().subscribe((data) => {
                        data.forEach((d) => {
                            locationData.employees.set(d.payload.doc.id, d.payload.doc.data());
                            this.locations.set(location, locationData);
                            if(this.currentLocation == null) {
                                this.currentLocation = locationData;
                                this.currentLocationKey = location;
                            }
                            res();
                        });
                    });
                });
            });
        }));
        Promise.all(locationFetchStatus).then(() => this.status.emit());
    }
    
    constructor(private afs: AngularFirestore) {}
}

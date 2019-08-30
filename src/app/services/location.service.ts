import { Injectable, EventEmitter } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Employee } from '../models/employee';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private locationsCollection:AngularFirestoreCollection<Location> = this.afs.collection("locations");
    private locations: Map<string, Location> = new Map();
    private currentLocation: Location = null;
    private currentLocationKey: string = null;
    public status: BehaviorSubject<boolean> = new BehaviorSubject(false);
    
    public getLocations(): Map<string, Location> {
        return this.locations;
    }
    
    public getCurrentLocationKey(): string {
        return this.currentLocationKey
    }
    
    public getCurrentLocation(): Location {
        return this.currentLocation;
    }
    
    public setCurrentLocation(key: string): void {
        this.currentLocation = this.locations.get(key);
        this.currentLocationKey = key;
    }
    
    private parseLocation(employeeData: DocumentChangeAction<Employee>, locationKey: string, locationData: Location, res: (value?: void |PromiseLike<void>) => void): void {
        locationData.employees.set(employeeData.payload.doc.id, employeeData.payload.doc.data());
        this.locations.set(locationKey, locationData);
        if (this.currentLocation == null) {
            this.setCurrentLocation(locationKey);
        }
        res();
    }

    public loadLocations(userInfo: UserInfo): void {
        this.locations.clear();
        let locationFetchStatus: Promise<void>[] = [];
        locationFetchStatus.push(new Promise((res, rej) => {
            userInfo.locations.forEach((locationKey) => {
                this.locationsCollection.doc<Location>(locationKey).valueChanges().subscribe((locationData) => {
                    locationData.employees = new Map();
                    this.afs.collection<Employee>(`locations/${locationKey}/employees`).snapshotChanges().subscribe((employeeSnapshot) => {
                        employeeSnapshot.forEach((employeeData) => this.parseLocation(employeeData, locationKey, locationData, res));
                    });
                });
            });
        }));
        Promise.all(locationFetchStatus).then(() => this.status.next(true));
    }
    
    constructor(private afs: AngularFirestore) {}
}

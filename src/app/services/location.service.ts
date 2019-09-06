import { Injectable, EventEmitter } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Employee } from '../models/employee';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private locationsCollection:AngularFirestoreCollection<Location> = this.afs.collection("locations");
    private locationsMap: Map<string, Location> = new Map();
    private currentLocationKey: Subject<string> = new Subject();
    private cachedCurrentLocationKey: string = null;
    private currentLocation: Subject<Location> = new Subject();
    private locations: Subject<Map<string, Location>> = new Subject();
    
    public getLocations(): Subject<Map<string, Location>> {
        return this.locations;
    }
    
    public getCurrentLocationKey(): Subject<string> {
        return this.currentLocationKey
    }
    
    public getCurrentLocation(): Subject<Location> {
        return this.currentLocation;
    }
    
    public setCurrentLocation(key: string): void {
        this.currentLocation.next(this.locationsMap.get(key));
        this.cachedCurrentLocationKey = key;
        this.currentLocationKey.next(key);
    }

    public addEmployeeToCurrentLocation(employee: Employee): Promise<void> {
        return new Promise((res, rej) => {
            this.afs.collection(`locations/${this.cachedCurrentLocationKey}/employees`).add(employee)
            .then(() => res())
            .catch(() => rej());
        });
    }
    
    private parseLocation(employeeData: DocumentChangeAction<Employee>, locationKey: string, locationData: Location): void {
        locationData.employees.set(employeeData.payload.doc.id, employeeData.payload.doc.data());
        this.locationsMap.set(locationKey, locationData);
    }

    public loadLocations(userInfo: UserInfo): void {
        this.locationsMap.clear();
        userInfo.locations.forEach((locationKey) => {
            this.locationsCollection.doc<Location>(locationKey).valueChanges().subscribe((locationData) => {
                locationData.employees = new Map();
                this.afs.collection<Employee>(`locations/${locationKey}/employees`).snapshotChanges().subscribe((employeeSnapshot) => {
                    employeeSnapshot.forEach((employeeData) => this.parseLocation(employeeData, locationKey, locationData));
                    this.locations.next(this.locationsMap);
                });
            });
        });
    }

    constructor(private afs: AngularFirestore) {
        this.getLocations().subscribe((locations) => {
            if(locations.size > 0) {
                this.setCurrentLocation(locations.keys().next().value);
            } else {
                this.setCurrentLocation("");
            }
        })
    }
}

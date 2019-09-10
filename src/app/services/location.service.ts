import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Employee } from '../models/employee';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Schedule } from '../models/schedule';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private locationsCollection:AngularFirestoreCollection<Location> = this.afs.collection("locations");
    private locationsMap: Map<string, Location> = new Map();
    private currentLocationKey: BehaviorSubject<string> = new BehaviorSubject("");
    private cachedCurrentLocationKey: string = null;
    private currentLocation: BehaviorSubject<Location> = new BehaviorSubject(null);
    private locations: BehaviorSubject<Map<string, Location>> = new BehaviorSubject(null);
    
    public getLocations(): BehaviorSubject<Map<string, Location>> {
        return this.locations;
    }
    
    public getCurrentLocationKey(): BehaviorSubject<string> {
        return this.currentLocationKey
    }
    
    public getCurrentLocation(): BehaviorSubject<Location> {
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

    public deleteEmployeeFromCurrentLocation(employeeId: string): Promise<void> {
        return new Promise((res, rej) => {
            this.afs.collection(`locations/${this.cachedCurrentLocationKey}/employees`).doc(employeeId).delete()
            .then(() => res())
            .catch(() => rej());
        });
    }
    
    private parseLocationEmployee(employeeData: DocumentChangeAction<Employee>, locationData: Location): void {
        locationData.employees.set(employeeData.payload.doc.id, employeeData.payload.doc.data());
    }

    private parseLocationSchedule(scheduleData: DocumentChangeAction<Schedule>, locationData: Location): void {
        locationData.schedules.set(scheduleData.payload.doc.id, scheduleData.payload.doc.data());
    }

    public loadLocations(userInfo: UserInfo): void {
        this.locationsMap.clear();
        userInfo.locations.forEach((locationKey) => {
            let locationDoc = this.locationsCollection.doc<Location>(locationKey);
            locationDoc.valueChanges().subscribe((locationData) => {
                locationData.employees = new Map();
                locationData.schedules = new Map();
                let combined = combineLatest(
                    locationDoc.collection<Employee>("employees").snapshotChanges(),
                    locationDoc.collection<Schedule>("schedules").snapshotChanges()
                );
                combined.subscribe(([employees, schedules]) => {
                    locationData.employees.clear();
                    employees.forEach((employeeData) => this.parseLocationEmployee(employeeData, locationData));
                    schedules.forEach((scheduleData) => this.parseLocationSchedule(scheduleData, locationData));
                    this.locationsMap.set(locationKey, locationData);
                    this.locations.next(this.locationsMap);
                });
            });
        });
    }

    constructor(private afs: AngularFirestore) {
        this.getLocations().subscribe((locations) => {
            if(locations){
                if(locations.size > 0) {
                    this.setCurrentLocation(locations.keys().next().value);
                } else {
                    this.setCurrentLocation("");
                }
            }
        })
    }
}

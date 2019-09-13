import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';
import { Employee } from '../models/employee';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Schedule } from '../models/schedule';
import { Sheet } from '../models/sheet';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    
    private currentLocationSub: Subscription;
    public currentLocation: Subject<Location> = new Subject();
    public currentLocationKey:string = "";
    // private locationsCollection:AngularFirestoreCollection<Location> = this.afs.collection("locations");
    // private locationsMap: Map<string, Location> = new Map();
    // private currentLocationKey: BehaviorSubject<string> = new BehaviorSubject("");
    // private cachedCurrentLocationKey: string = null;
    // private currentLocation: BehaviorSubject<Location> = new BehaviorSubject(null);
    // private locations: BehaviorSubject<Map<string, Location>> = new BehaviorSubject(null);
    
    // public getLocations(): BehaviorSubject<Map<string, Location>> {
    //     return this.locations;
    // }
    
    // public getCurrentLocationKey(): BehaviorSubject<string> {
    //     return this.currentLocationKey
    // }
    
    // public getCurrentLocation(): BehaviorSubject<Location> {
    //     return this.currentLocation;
    // }
    
    // public setCurrentLocation(key: string): void {
    //     this.currentLocation.next(this.locationsMap.get(key));
    //     this.cachedCurrentLocationKey = key;
    //     this.currentLocationKey.next(key);
    // }

    // public addEmployeeToCurrentLocation(employee: Employee): Promise<void> {
    //     return new Promise((res, rej) => {
    //         this.locationsCollection.doc(this.cachedCurrentLocationKey).collection("employees").add(employee)
    //         .then(() => res())
    //         .catch(() => rej());
    //     });
    // }

    // public deleteEmployeeFromCurrentLocation(employeeId: string): Promise<void> {
    //     return new Promise((res, rej) => {
    //         this.locationsCollection.doc(this.cachedCurrentLocationKey).collection("employees").doc(employeeId).delete()
    //         .then(() => res())
    //         .catch(() => rej());
    //     });
    // }

    // public addScheduleToCurrentLocation(schedule: Schedule): Promise<void> {
    //     return new Promise((res, rej) => {
    //         this.locationsCollection.doc(this.cachedCurrentLocationKey).collection("schedules").add(schedule)
    //             .then((data) => {
    //                 let s = {
    //                     label: "untitled",
    //                     timeIncrement: 1,
    //                     shifts: [],
    //                 } as Sheet;
    //                 this.locationsCollection.doc(this.cachedCurrentLocationKey).collection("schedules").doc(data.id).collection("sheets").add(s);
    //                 res();
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 rej()
    //             });
    //     });
    // }
    
    // public deleteScheduleFromCurrentLocation(scheduleId: string): Promise<void> {
    //     return new Promise((res, rej) => {
    //         this.locationsCollection.doc(this.cachedCurrentLocationKey).collection("schedules").doc(scheduleId).delete()
    //             .then(() => res())
    //             .catch(() => rej());
    //     });
    // }

    // private parseLocationEmployee(employeeData: DocumentChangeAction<Employee>, locationData: Location): void {
    //     locationData.employees.set(employeeData.payload.doc.id, employeeData.payload.doc.data());
    // }

    // private parseLocationSchedule(scheduleData: DocumentChangeAction<Schedule>, locationData: Location): void {
    //     locationData.schedules.set(scheduleData.payload.doc.id, scheduleData.payload.doc.data());
    // }

    // public loadLocations(userInfo: UserInfo): void {

        // this.locationsMap.clear();
        // userInfo.locations.forEach((locationKey) => {
        //     let locationDoc = this.locationsCollection.doc<Location>(locationKey);
        //     locationDoc.valueChanges().subscribe((locationData) => {
        //         locationData.employees = new Map();
        //         locationData.schedules = new Map();
        //         let combined = combineLatest(
        //             locationDoc.collection<Employee>("employees").snapshotChanges(),
        //             locationDoc.collection<Schedule>("schedules").snapshotChanges()
        //         );
        //         combined.subscribe(([employees, schedules]) => {
        //             locationData.employees.clear();
        //             locationData.schedules.clear();
        //             employees.forEach((employeeData) => this.parseLocationEmployee(employeeData, locationData));
        //             schedules.forEach((scheduleData) => this.parseLocationSchedule(scheduleData, locationData));
        //             this.locationsMap.set(locationKey, locationData);
        //             this.locations.next(this.locationsMap);
        //         });
        //     });
        // });
    // }

    public loadLocation(locationId: string): void {
        console.log("Loading Location", locationId);
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
            console.log(userInfo);
        });
        // this.getLocations().subscribe((locations) => {
        //     if(locations){
        //         if(locations.size > 0) {
        //             this.setCurrentLocation(locations.keys().next().value);
        //         } else {
        //             this.setCurrentLocation("");
        //         }
        //     }
        // })
    }
}

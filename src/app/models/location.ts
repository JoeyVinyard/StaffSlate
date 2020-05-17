import {  AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable, Subject, ReplaySubject, Subscription } from 'rxjs';
import { Employee } from './employee';
import { Schedule } from './schedule';
import { Identifier } from './identifier';

export interface NewLocation {
    label: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    owner: string;
    managers: string[];
}

export class Location {
    label: string = "";
    address: string = "";
    city: string = "";
    state: string = "";
    zip: string = "";
    owner: string;
    managers: string[] = [];
    document: AngularFirestoreDocument<Location>;
    
    private schedules: ReplaySubject<Map<string, Schedule>> = new ReplaySubject(1);
    private employees: ReplaySubject<Map<string, Employee>> = new ReplaySubject(1);
    private currentSchedule: ReplaySubject<Schedule> = new ReplaySubject(1);
    private cachedSchedules: Map<string, Schedule> = new Map<string, Schedule>();

    public loadEmployees(): void {
        this.document.collection<Employee>("employees").snapshotChanges().subscribe((employeeSnapshots) => {
            let m = new Map<string, Employee>();
            employeeSnapshots.forEach((emp) => {
                m.set(emp.payload.doc.id, emp.payload.doc.data());
            });
            this.employees.next(m);
        })
    }

    public getEmployees(): ReplaySubject<Map<string, Employee>> {
        return this.employees;
    }
    
    public updateEmployee(employeeId: string, employeeData: Employee): Promise<void> {
        return this.document.collection("employees").doc(employeeId).update(employeeData);
    }

    public addEmployee(employee: Employee): Promise<DocumentReference> {
        return this.document.collection("employees").add(employee);
    }

    public deleteEmployee(employeeId: string): Promise<void> {
        return this.document.collection("employees").doc(employeeId).delete();
    }

    public getSchedules(): Observable<Map<string, Schedule>> {
        return this.schedules;
    }

    public loadSchedules(): void {
        this.document.collection<Schedule>("schedules").snapshotChanges().subscribe((schedules) => {
            let m = new Map<string, Schedule>();
            schedules.forEach((schedule) => {
                m.set(schedule.payload.doc.id, schedule.payload.doc.data());
            });
            this.schedules.next(m);
        });
    }

    public loadScheduleData(scheduleId: string): Observable<Schedule> {
        if(scheduleId == null) {
            return this.currentSchedule;
        }
        if(this.cachedSchedules.has(scheduleId)) {
            this.currentSchedule.next(this.cachedSchedules.get(scheduleId));
        } else {
            this.document.collection("schedules").doc<Schedule>(scheduleId).valueChanges().subscribe((schedule: Schedule) => {
                let s = new Schedule(schedule, this.document.collection("schedules").doc<Schedule>(scheduleId));
                this.currentSchedule.next(s);
                this.cachedSchedules.set(scheduleId, s);
            });
        }
        return this.currentSchedule;
    }

    public addSchedule(schedule: Schedule): Promise<DocumentReference> {
        return this.document.collection("schedules").add(schedule)
    }

    public deleteSchedule(scheduleId: string): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("schedules").doc(scheduleId).delete().then(() => {
                res();
            }).catch((err) => {
                rej(err);
            });
        });
    }

    constructor(locationData: Location, document: AngularFirestoreDocument<Location>) {
        this.label = locationData.label;
        this.managers = locationData.managers;
        this.owner = locationData.owner;
        this.address = locationData.address;
        this.city = locationData.city;
        this.state = locationData.state;
        this.zip = locationData.zip;
        this.document = document;
        this.loadEmployees();
        this.loadSchedules();
    }
}

import {  AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable, Subject, ReplaySubject, Subscription } from 'rxjs';
import { Employee } from './employee';
import { Schedule } from './schedule';

export class Location {
    label: string = "";
    schedules: string[] = [];
    private employees: ReplaySubject<Map<string, Employee>> = new ReplaySubject(1);
    private currentSchedule: ReplaySubject<Schedule> = new ReplaySubject(1);
    private cachedSchedules: Map<string, Schedule> = new Map<string, Schedule>();
    document: AngularFirestoreDocument<Location>;

    public loadEmployees(): void {
        this.document.collection<Employee>("employees").valueChanges().subscribe((employees) => {
            let m = new Map<string, Employee>();
            employees.forEach((emp) => {
                m.set(emp.id, emp);
            });
            this.employees.next(m);
        })
    }

    public getEmployees(): ReplaySubject<Map<string, Employee>> {
        return this.employees;
    }
    
    public addEmployee(employee: Employee): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("employees").add(employee).then((ref: DocumentReference) => {
                this.document.collection("employees").doc(ref.id).update({ id: ref.id }).then(() => {
                    res();
                }).catch((err) => {
                    rej(err);
                });
            });
        });
    }

    public deleteEmployee(employeeId: string): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("employees").doc(employeeId).delete().then(() => {
                res();
            }).catch((err) => {
                rej(err);
            });
        })
    }

    public loadScheduleData(scheduleId: string): Observable<Schedule> {
        if(this.cachedSchedules.has(scheduleId)) {
            console.log("Loading cached", scheduleId);
            this.currentSchedule.next(this.cachedSchedules.get(scheduleId));
        } else {
            console.log("Loading new", scheduleId);
            this.document.collection("schedules").doc<Schedule>(scheduleId).valueChanges().subscribe((schedule: Schedule) => {
                let s = new Schedule(schedule, this.document.collection("schedules").doc<Schedule>(scheduleId));
                this.currentSchedule.next(s);
                this.cachedSchedules.set(scheduleId, s);
            });
        }
        return this.currentSchedule;
    }

    public addSchedule(schedule: Schedule): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("schedules").doc(schedule.label).set(schedule).then(() => {
                this.schedules.push(schedule.label);
                this.document.update({schedules: this.schedules}).then(() => {
                    res();
                }).catch((err) => {
                    rej(err);
                });
            }).catch((err) => {
                rej(err);
            });
        });
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
        this.schedules = locationData.schedules;
        this.document = document;
        this.loadEmployees();
    }
}

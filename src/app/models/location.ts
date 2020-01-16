import {  AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { Employee } from './employee';
import { Schedule } from './schedule';

export class Location {
    label: string = "";
    id: string = "";
    private employees: ReplaySubject<Map<string, Employee>> = new ReplaySubject(1);
    private cachedSchedules: Map<string, Schedule> = new Map<string, Schedule>();
    document: AngularFirestoreDocument<Location>;

    loadEmployees(): void {
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
    
    addEmployee(employee: Employee): Promise<void> {
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

    deleteEmployee(employeeId: string): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("employees").doc(employeeId).delete().then(() => {
                res();
            }).catch((err) => {
                rej(err);
            });
        })
    }

    loadScheduleData(scheduleId: string): Observable<Schedule> {
        return this.document.collection("schedules").doc<Schedule>(scheduleId).valueChanges();
    }

    loadSchedules(): Observable<Schedule[]> {
        return this.document.collection<Schedule>("schedules").valueChanges();
    }

    addSchedule(schedule: Schedule): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("schedules").doc(schedule.label).set(schedule).then(() => {
                res();
            }).catch((err) => {
                rej(err);
            });
        });
    }

    deleteSchedule(scheduleId: string): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("schedules").doc(scheduleId).delete().then(() => {
                res();
            }).catch((err) => {
                rej(err);
            });
        })
    }

    constructor(locationData: Location, document: AngularFirestoreDocument<Location>) {
        this.label = locationData.label;
        this.id = locationData.id;
        this.document = document;
        this.loadEmployees();
    }
}

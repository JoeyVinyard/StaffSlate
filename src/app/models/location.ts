import {  AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Employee } from './employee';
import { Schedule } from './schedule';

export class Location {
    label: string = "";
    id: string = "";
    document: AngularFirestoreDocument<Location>;

    loadEmployees(): Observable<Employee[]> {
        return this.document.collection<Employee>("employees").valueChanges();
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

    fetchEmployee(employeeId: string): Observable<Employee> {
        return this.document.collection("employees").doc<Employee>(employeeId).valueChanges();
    }

    loadSchedules(): Observable<Schedule[]> {
        return this.document.collection<Schedule>("schedules").valueChanges();
    }

    addSchedule(schedule: Schedule): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("schedules").add(schedule).then((ref: DocumentReference) => {
                this.document.collection("schedules").doc(ref.id).update({ id: ref.id }).then(() => {
                    res();
                }).catch((err) => {
                    rej(err);
                });
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
    }
}

import { Employee } from './employee';
import { Schedule } from './schedule';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export class Location {
    employees: Map<string, Employee>;
    schedules: Map<string, Schedule>;
    name: string;
    document: AngularFirestoreDocument<Location>;

    loadEmployees(): Observable<Employee[]> {
        return this.document.collection<Employee>("employees").valueChanges();
    }


    
    addEmployee(employee: Employee): Promise<void> {
        return new Promise((res, rej) => {
            this.document.collection("employees").add(employee).then((ref: DocumentReference) => {
                this.document.collection("employees").doc(ref.id).update({id: ref.id});
            })
        });
    }

    constructor(private afs: AngularFirestore) {}
}

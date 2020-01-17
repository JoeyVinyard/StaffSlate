import { Time } from '@angular/common';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

export class Shift {
    startTime: Time;
    endTime: Time;
    empId: string;
    document: AngularFirestoreDocument<Shift>;

    constructor(shiftData: Shift, document: AngularFirestoreDocument<Shift>) {
        this.startTime = shiftData.startTime;
        this.endTime = shiftData.endTime;
        this.empId = shiftData.empId;
        this.document = document;
    }

}

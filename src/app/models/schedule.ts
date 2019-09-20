import { AngularFirestoreDocument } from '@angular/fire/firestore';

export class Schedule {
    document: AngularFirestoreDocument;
    label: string;
    id: string;

    constructor(scheduleData: Schedule, document: AngularFirestoreDocument) {
        this.label = scheduleData.label;
        this.id = scheduleData.id;
        this.document = document;
    }
}
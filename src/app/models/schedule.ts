import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Sheet } from './sheet';

export class Schedule {
    document: AngularFirestoreDocument;
    label: string;
    id: string;

    public loadSheets(): Observable<Sheet[]> {
        return this.document.collection<Sheet>("sheets").valueChanges();
    }

    constructor(scheduleData: Schedule, document: AngularFirestoreDocument) {
        this.label = scheduleData.label;
        this.id = scheduleData.id;
        this.document = document;
    }
}
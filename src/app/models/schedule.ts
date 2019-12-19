import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Sheet } from './sheet';

export class Schedule {
    label: string;
    id: string;
    sheetOrder: number[];
    viewId: string;

    public loadSheets(): Observable<DocumentChangeAction<Sheet>[]> {
        return this.document.collection<Sheet>("sheets").snapshotChanges();
    }

    constructor(scheduleData: Schedule, public document: AngularFirestoreDocument<Schedule>) {
        this.label = scheduleData.label;
        this.id = scheduleData.id;
        this.sheetOrder = scheduleData.sheetOrder;
        this.viewId = scheduleData.viewId;
    }
}
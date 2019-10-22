import { Shift } from './shift';
import { Time } from '@angular/common';
import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export class Sheet {
    label: string;
    timeIncrement: number;
    openTime: Time;
    closeTime: Time;

    public loadShifts(): Observable<DocumentChangeAction<Shift>[]> {
        return this.document.collection<Shift>("shifts").snapshotChanges();
    }

    public loadDisplayShifts(): Observable<Shift[]> {
        return this.document.collection<Shift>("shifts").valueChanges();
    }

    constructor(sheetData: Sheet, public document: AngularFirestoreDocument<Sheet>) {
        this.label = sheetData.label;
        this.timeIncrement = sheetData.timeIncrement;
        this.openTime = sheetData.openTime;
        this.closeTime = sheetData.closeTime;
    }
}

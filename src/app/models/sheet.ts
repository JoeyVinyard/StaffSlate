import { Shift } from './shift';
import { Time } from '@angular/common';
import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';

export class Sheet {
    label: string;
    timeIncrement: number;
    openTime: Time;
    closeTime: Time;
    private shifts: ReplaySubject<Shift[]> = new ReplaySubject(1);

    public loadShifts(): Observable<Shift[]> {
        this.document.collection<Shift>("shifts").snapshotChanges().subscribe((shifts) => {
            this.shifts.next(shifts.map((shift: DocumentChangeAction<Shift>) => {
                return new Shift(shift.payload.doc.data(), this.document.collection<Shift>("shifts").doc(shift.payload.doc.id));
            }));
        })
        return this.shifts;
    }

    constructor(sheetData: Sheet, public document: AngularFirestoreDocument<Sheet>) {
        this.label = sheetData.label;
        this.timeIncrement = sheetData.timeIncrement;
        this.openTime = sheetData.openTime;
        this.closeTime = sheetData.closeTime;
    }
}

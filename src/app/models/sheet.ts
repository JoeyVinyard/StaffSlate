import { Shift, PrintShift } from './shift';
import { Time } from '@angular/common';
import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';

export class Sheet {
    label: string;
    timeIncrement: number;
    openTime: Time;
    closeTime: Time;
    private shifts: ReplaySubject<Shift[]> = new ReplaySubject(1);
    private cachedShifts: Shift[];

    public loadShifts(): Observable<Shift[]> {
        if(!this.cachedShifts) {
            this.document.collection<Shift>("shifts").snapshotChanges().subscribe((shifts) => {
                this.cachedShifts = shifts.map((shift: DocumentChangeAction<Shift>) => {
                    return new Shift(shift.payload.doc.data(), this.document.collection<Shift>("shifts").doc(shift.payload.doc.id));
                });
                this.shifts.next(this.cachedShifts);
            })
        }
        return this.shifts;
    }

    constructor(sheetData: Sheet, public document: AngularFirestoreDocument<Sheet>) {
        this.label = sheetData.label;
        this.timeIncrement = sheetData.timeIncrement;
        this.openTime = sheetData.openTime;
        this.closeTime = sheetData.closeTime;
    }
}

export interface PrintSheet {
    label: string;
    shifts: PrintShift[];
    openTime: Time;
    closeTime: Time;
}
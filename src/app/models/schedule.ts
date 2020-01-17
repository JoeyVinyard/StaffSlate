import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { Sheet } from './sheet';
import { Identifier } from './identifier';

export class Schedule {
    label: string;
    sheets: Identifier[];
    viewId: string;
    private cachedSheets: Map<string, Sheet> = new Map();
    private currentSheet: ReplaySubject<Sheet> = new ReplaySubject(1);

    public loadSheetData(sheetId: string): Observable<Sheet> {
        if(this.cachedSheets.has(sheetId)) {
            this.currentSheet.next(this.cachedSheets.get(sheetId));
        } else {
            this.document.collection<Sheet>("sheets").doc(sheetId).valueChanges().subscribe((sheet: Sheet) => {
                if(!sheet) {
                    return;
                }
                let s = new Sheet(sheet, this.document.collection<Sheet>("sheets").doc(sheetId));
                this.currentSheet.next(s);
                this.cachedSheets.set(sheetId, s);
            });
        }
        return this.currentSheet;
    }

    constructor(scheduleData: Schedule, public document: AngularFirestoreDocument<Schedule>) {
        this.label = scheduleData.label;
        this.sheets = scheduleData.sheets;
        this.viewId = scheduleData.viewId;
    }
}

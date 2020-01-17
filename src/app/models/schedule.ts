import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { Sheet } from './sheet';

export class Schedule {
    label: string;
    sheets: string[];
    viewId: string;
    private cachedSheets: Map<string, Sheet> = new Map();
    private currentSheet: ReplaySubject<Sheet> = new ReplaySubject(1);

    public loadSheetData(sheetId: string): Observable<Sheet> {
        if(this.cachedSheets.has(sheetId)) {
            console.log("loading cached sheet");
            this.currentSheet.next(this.cachedSheets.get(sheetId));
        } else {
            console.log("Loading new sheet");
            this.document.collection<Sheet>("sheets").doc(sheetId).valueChanges().subscribe((sheet: Sheet) => {
                let s = new Sheet(sheet, this.document.collection<Sheet>("sheets").doc(sheetId));
                this.currentSheet.next(s);
                this.cachedSheets.set(sheetId, s);
            });
        }
        return this.currentSheet;
    }

    public loadSheets(): Observable<DocumentChangeAction<Sheet>[]> {
        return this.document.collection<Sheet>("sheets").snapshotChanges();
    }

    constructor(scheduleData: Schedule, public document: AngularFirestoreDocument<Schedule>) {
        this.label = scheduleData.label;
        this.sheets = scheduleData.sheets;
        this.viewId = scheduleData.viewId;
    }
}
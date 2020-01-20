import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { Sheet, PrintSheet } from './sheet';
import { Identifier } from './identifier';
import { Time } from '@angular/common';

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
                let s = new Sheet(sheet, this.document.collection<Sheet>("sheets").doc(sheetId));
                this.currentSheet.next(s);
                this.cachedSheets.set(sheetId, s);
            });
        }
        return this.currentSheet;
    }

    public loadSheetDataSilently(sheetId: string): Promise<Sheet> {
        return new Promise<Sheet>((res,rej) => {
            if(this.cachedSheets.has(sheetId)) {
                res(this.cachedSheets.get(sheetId));
            } else {
                let sub = this.document.collection<Sheet>("sheets").doc(sheetId).valueChanges().subscribe((sheet: Sheet) => {
                    let s = new Sheet(sheet, this.document.collection<Sheet>("sheets").doc(sheetId));
                    this.cachedSheets.set(sheetId, s);
                    sub.unsubscribe();
                    res(s);
                });
            }
        });
    }

    public printSchedule(): Promise<PrintSchedule> {
        return new Promise<PrintSchedule>((res,rej) => {
            let promises: Promise<Sheet>[] = [];
            this.sheets.forEach((sheetId: Identifier) => {
                promises.push(new Promise<Sheet>((res, rej) => {
                    this.loadSheetDataSilently(sheetId.key).then((sheet: Sheet) => {
                        res(sheet);
                    });
                }));
            });
            Promise.all(promises).then((sheets: Sheet[]) => {
                let shiftPromises = [];
                sheets.forEach((sheet: Sheet) => {
                    shiftPromises.push(new Promise<PrintSheet>((res,rej) => {
                        sheet.loadShifts().subscribe((shifts) => {
                            let printSheet: PrintSheet = new PrintSheet(sheet);
                            printSheet.shifts = shifts;
                            res(printSheet);
                        });
                    }));
                });
                Promise.all(shiftPromises).then((pSheets: PrintSheet[]) => {
                    let pSchedule: PrintSchedule = new PrintSchedule(this.sheets, pSheets);
                    res(pSchedule);
                });
            });
        });
    }

    constructor(scheduleData: Schedule, public document: AngularFirestoreDocument<Schedule>) {
        this.label = scheduleData.label;
        this.sheets = scheduleData.sheets;
        this.viewId = scheduleData.viewId;
    }
}

export class PrintSchedule {
    public timeColumns: Time[];
    constructor(public sheetIds: Identifier[], public sheets: PrintSheet[]){}
}
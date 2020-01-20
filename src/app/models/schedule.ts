import { AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { Sheet, PrintSheet } from './sheet';
import { Identifier } from './identifier';
import { Time } from '@angular/common';
import { Shift, PrintShift } from './shift';

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
                            let printSheet: PrintSheet = {
                                label: sheet.label,
                                openTime: sheet.openTime,
                                closeTime: sheet.closeTime,
                                shifts: null
                            } as PrintSheet;
                            printSheet.shifts = shifts.map((s: Shift) => {
                                return {
                                    empId: s.empId,
                                    startTime: s.startTime,
                                    endTime: s.endTime
                                } as PrintShift;
                            });
                            res(printSheet);
                        });
                    }));
                });
                Promise.all(shiftPromises).then((pSheets: PrintSheet[]) => {
                    let pSchedule: PrintSchedule = {
                        timeColumns: null,
                        sheetIds: this.sheets,
                        sheets: pSheets
                    } as PrintSchedule;
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

export interface PrintSchedule {
    timeColumns: Time[];
    sheetIds: Identifier[];
    sheets: PrintSheet[];
}
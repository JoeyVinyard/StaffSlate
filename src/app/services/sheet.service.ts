import { Injectable } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Schedule } from '../models/schedule';
import { Subscription, ReplaySubject, Observable } from 'rxjs';
import { ScheduleService } from './schedule.service';
import { Sheet } from '../models/sheet';

@Injectable({
  providedIn: 'root'
})
export class SheetService {

  currentSheet: ReplaySubject<Sheet> = new ReplaySubject(1);
  private currentScheduleDoc: AngularFirestoreDocument<Schedule>;
  private currentSheetSub: Subscription;
  private scOb: Subscription;

  loadSheet(sheetId: string): Observable<Sheet> {
    this.scOb = this.scheduleService.getCurrentSchedule().subscribe((schedule) => {
      if(this.currentSheetSub) {
        this.currentSheetSub.unsubscribe();
      }
      this.currentSheetSub =  this.currentScheduleDoc.collection("sheets").doc<Sheet>(sheetId).valueChanges().subscribe((sheetData) => {
        this.currentSheet.next(new Sheet(sheetData, this.currentScheduleDoc.collection("sheets").doc<Sheet>(sheetId)));
      });
      if(this.scOb){
        this.scOb.unsubscribe();
      }
    });
    return this.currentSheet;
  }

  constructor(private scheduleService: ScheduleService) {
    this.scheduleService.getCurrentSchedule().subscribe((schedule: Schedule) => {
      this.currentScheduleDoc = schedule.document;
    });
  }
}

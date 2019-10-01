import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Schedule } from '../models/schedule';
import { Subscription, ReplaySubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  currentLocationDoc: AngularFirestoreDocument;
  currentScheduleSub: Subscription;
  currentSchedule: ReplaySubject<Schedule> = new ReplaySubject(1);
  clOb: Subscription;

  loadSchedule(scheduleId: string): Observable<Schedule> {
    this.clOb = this.locationService.currentLocation.subscribe((location) => {
      if(this.currentScheduleSub) {
        this.currentScheduleSub.unsubscribe();
      }
      this.currentScheduleSub =  this.currentLocationDoc.collection("schedules").doc<Schedule>(scheduleId).valueChanges().subscribe((scheduleData) => {
        this.currentSchedule.next(new Schedule(scheduleData, this.currentLocationDoc.collection("schedules").doc<Schedule>(scheduleId)));
      });
      if(this.clOb){
        this.clOb.unsubscribe();
      }
    });
    return this.currentSchedule;
  }

  constructor(private locationService: LocationService) {
    this.locationService.currentLocation.subscribe((location) => {
      this.currentLocationDoc = location.document;
    });
  }
}

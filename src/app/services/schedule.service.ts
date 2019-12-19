import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Schedule } from '../models/schedule';
import { Subscription, ReplaySubject, Observable } from 'rxjs';
import { Location } from '../models/location';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  currentLocationDoc: AngularFirestoreDocument;
  currentSchedule: ReplaySubject<Schedule> = new ReplaySubject(1);
  private currentScheduleSub: Subscription;

  loadSchedule(location: Location, scheduleId: string): Observable<Schedule> {
    if(this.currentScheduleSub) {
      this.currentScheduleSub.unsubscribe();
    }
    this.currentScheduleSub =  this.currentLocationDoc.collection("schedules").doc<Schedule>(scheduleId).valueChanges().subscribe((scheduleData) => {
      this.currentSchedule.next(new Schedule(scheduleData, this.currentLocationDoc.collection("schedules").doc<Schedule>(scheduleId)));
    });
    return this.currentSchedule;
  }

  constructor(private locationService: LocationService) {
    this.locationService.currentLocation.subscribe((location) => {
      this.currentLocationDoc = location.document;
    });
  }
}

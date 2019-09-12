import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Schedule } from '../models/schedule';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private locationService: LocationService) { }
}

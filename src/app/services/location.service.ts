import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Location } from '../models/location';
import { UserInfo } from '../models/user-info';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  locationsCollection:AngularFirestoreCollection<Location> = this.afs.collection("locations");
  locations: Location[];


  loadLocations(userInfo: UserInfo): void {
    this.locationsCollection.valueChanges().subscribe((locations: Location[]) => {
      this.locations = locations;
      console.log(this.locations);
    });
  }

  constructor(private afs: AngularFirestore) {}
}

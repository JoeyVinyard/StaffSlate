import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from 'firebase';
import { UserInfo } from '../models/user-info';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser: User;
  currentUserInfo: UserInfo;

  private loadUserInfo(user: User): void {
    // let query: Observable<UserInfo> = this.afStorage.collection<UserInfo>('users', ref => ref.where('email', '==', this.currentUser.email)).get();
    let doc: Observable<UserInfo> = this.afStorage.doc<UserInfo>(`users/${this.currentUser.email}`).valueChanges();
    doc.subscribe(data => console.log(data));
  }

  constructor(private afAuth: AngularFireAuth, private afStorage: AngularFirestore) {
    afAuth.user.subscribe((user) => {
      this.currentUser = user
      this.loadUserInfo(user);
    });
  }
}

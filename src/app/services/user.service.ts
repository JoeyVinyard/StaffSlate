import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentSnapshot, Action } from '@angular/fire/firestore';
import { User } from 'firebase';
import { UserInfo } from '../models/user-info';
import { Observable, ReplaySubject, Subscription, combineLatest } from 'rxjs';
import { takeLast, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentSubscription: Subscription;
  private currentUserInfoSubject: ReplaySubject<UserInfo> = new ReplaySubject(1);
  private currentUser: UserInfo;

  public getCurrentUserInfo(): Observable<UserInfo> {
    return this.currentUserInfoSubject;
  }

  public register(info: UserInfo, password: string): Promise<void> {
    return new Promise<void>((res,rej) => {
      this.afAuth.auth.createUserWithEmailAndPassword(info.email, password).then((credentials) => {
        return this.afs.collection("users").doc(info.email).set(info);
      }).then(() => {
        return this.afAuth.auth.currentUser.sendEmailVerification();
      }).then(() => {
        res();
      }).catch((err) => {
        rej(err);
      })
    });
  }

  public setLastAccessedLocation(locationId: string): void {
    if(this.currentUser.lastAccessed != locationId) {
      this.afs.collection("users").doc(this.currentUser.email).update({lastAccessed: locationId}).catch((err) => console.error(err));
    }
  }

  public logout(): Promise<void> {
    if(this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
    return this.afAuth.auth.signOut();
  }

  public loadUserInfo(user: User): void {
    if(this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
    this.currentSubscription = this.afs.collection("users").doc<UserInfo>(user.email).valueChanges().subscribe((userInfo) => {
      this.currentUser = userInfo;
      this.currentUserInfoSubject.next(userInfo);
    });
  }

  public loadUserInfoFromEmail(email: string): Observable<UserInfo> {
    return this.afs.collection("users").doc<UserInfo>(email).valueChanges();
  }

  public loadUserInfosFromEmails(emails: string[]): Observable<Action<DocumentSnapshot<UserInfo>>[]> {
    let observables: Observable<Action<DocumentSnapshot<UserInfo>>>[] = [];
    emails.forEach((email) => {
      observables.push(this.afs.collection("users").doc<UserInfo>(email).snapshotChanges());
    });
    return combineLatest(observables);
  }

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    afAuth.user.subscribe((user) => {
      if(user){
        this.loadUserInfo(user);
      } else {
        this.currentUserInfoSubject.next(null);
      }
    });
  }
}

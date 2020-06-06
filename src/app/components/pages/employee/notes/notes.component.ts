import { Component, OnDestroy } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EmployeeRouteParams } from '../employee-route-params';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Note } from 'src/app/models/note';
import { firestore } from 'firebase'

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnDestroy {

  private alive: Subject<boolean> = new Subject();
  private employeeId: string;
  public notes: [string, Note][];

  public displayTimestamp(timestamp: firestore.Timestamp): string {
    return timestamp.toDate().toDateString();
  }

  public truncate(content: string): string {
    let maxCharLength = Math.floor(80*(window.innerWidth/1920));
    return content.length > maxCharLength ? `${content.substr(0,maxCharLength)}...` : content;
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(private afs: AngularFirestore, private route: ActivatedRoute, private locationService: LocationService) {
    this.route.params.pipe(
      switchMap((params: EmployeeRouteParams) => {
        this.employeeId = params.employeeId;
        return this.locationService.getCurrentLocation();
      }),
      switchMap((location: Location) => location.document.collection<Note>(`employees/${this.employeeId}/notes`).snapshotChanges()),
      takeUntil(this.alive)
    ).subscribe((notes: DocumentChangeAction<Note>[]) => {
      this.notes = notes.map((noteDocument: DocumentChangeAction<Note>) => [noteDocument.payload.doc.id, noteDocument.payload.doc.data()]);
    });
  }

}

import { Component, OnDestroy } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EmployeeRouteParams } from '../employee-route-params';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Note } from 'src/app/models/note';
import { firestore } from 'firebase'
import { MatDialog } from '@angular/material/dialog';
import { NewNoteDialogComponent } from './new-note-dialog/new-note-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnDestroy {

  private alive: Subject<boolean> = new Subject();
  private employeeId: string;
  private notesCollection: AngularFirestoreCollection<Note>;
  public notes: [string, Note][];
  public filteredNotes: [string, Note][];

  public openNewNoteDialog(note?: [string, Note]): void {
    let dialogRef = this.dialog.open(NewNoteDialogComponent, {width: "300px"})
    dialogRef.afterClosed().subscribe((newNote: Note) => {
      if(newNote) {
        if(note) {
          this.notesCollection.doc(note[0]).update(newNote)
          .then(() => this.snackbar.open("Note Successfully Updated", "Dismiss", {duration: 3000}))
          .catch(() => this.snackbar.open("Failed to update note. Please try again", "Dismiss", {duration: 3000}));
        } else {
          this.notesCollection.add(newNote)
          .then(() => this.snackbar.open("Note Successfully Added", "Dismiss", {duration: 3000}))
          .catch(() => this.snackbar.open("Failed to add note. Please try again", "Dismiss", {duration: 3000}));
        }
      }
    });
  }

  public displayTimestamp(timestamp: firestore.Timestamp): string {
    return timestamp.toDate().toDateString();
  }

  public filter(text: string): void {
    this.filteredNotes = this.notes.filter((note: [string, Note]) => note[1].content.includes(text) || note[1].title.includes(text));
  }

  public truncateTitle(title: string): string {
    let maxCharLength = Math.floor(50*(window.innerWidth/1920));
    return title.length > maxCharLength ? `${title.substr(0,maxCharLength)}...` : title;
  }

  public truncateContent(content: string): string {
    let maxCharLength = Math.floor(80*(window.innerWidth/1920));
    return content.length > maxCharLength ? `${content.substr(0,maxCharLength)}...` : content;
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(
    private afs: AngularFirestore,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.route.params.pipe(
      switchMap((params: EmployeeRouteParams) => {
        this.employeeId = params.employeeId;
        return this.locationService.getCurrentLocation();
      }),
      switchMap((location: Location) => {
        this.notesCollection = location.document.collection<Note>(`employees/${this.employeeId}/notes`)
        return location.document.collection<Note>(`employees/${this.employeeId}/notes`).snapshotChanges()
      }),
      takeUntil(this.alive)
    ).subscribe((notes: DocumentChangeAction<Note>[]) => {
      this.notes = notes.map((noteDocument: DocumentChangeAction<Note>) => [noteDocument.payload.doc.id, noteDocument.payload.doc.data()]);
      this.filteredNotes = notes.map((noteDocument: DocumentChangeAction<Note>) => [noteDocument.payload.doc.id, noteDocument.payload.doc.data()]);
    });
  }

}

import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from 'src/app/models/location';
import { ActivatedRoute, Params } from '@angular/router';
import { Employee } from 'src/app/models/employee';
import { AngularFirestore, Query, DocumentChangeAction, QueryDocumentSnapshot, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore';
import { Shift } from 'src/app/models/shift';
import { Schedule } from 'src/app/models/schedule';
import { Identifier } from 'src/app/models/identifier';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnDestroy{

  private alive: Subject<boolean> = new Subject<boolean>();
  public employee: Employee = {} as Employee;
  public employeeId: string;
  public employeeShifts: Shift[];
  private fullShiftMap: Map<string, Map<string, Shift[]>> = new Map();
  private scheduleMap: Map<string, Schedule> = new Map();

  private findEmployeeShifts(): void {
    let query = this.afs.collectionGroup("shifts", (ref: Query) => ref.where("empId", "==", this.employeeId)).snapshotChanges();
    query.pipe(takeUntil(this.alive))
    .subscribe((shifts: DocumentChangeAction<Shift>[]) => {
      this.fullShiftMap = new Map<string, Map<string, Shift[]>>();
      shifts.forEach((shift: DocumentChangeAction<Shift>) => {
        let shiftDoc = shift.payload.doc;
        let sheetRef = shiftDoc.ref.parent.parent;
        let scheduleRef = sheetRef.parent.parent;
        this.addShift(shiftDoc, sheetRef, scheduleRef);
      });
    });
  }

  private addShift(shiftDoc: QueryDocumentSnapshot<Shift>, sheetRef: DocumentReference, scheduleRef: DocumentReference): void {
    if(this.fullShiftMap.has(scheduleRef.id)) {
      let sheetMap = this.fullShiftMap.get(scheduleRef.id);
      if(sheetMap.has(sheetRef.id)) {
        sheetMap.get(sheetRef.id).push(shiftDoc.data());
      } else {
        sheetMap.set(sheetRef.id, [shiftDoc.data()]);
      }
    } else {
      let sheetMap = new Map<string, Shift[]>();
      sheetMap.set(sheetRef.id, [shiftDoc.data()]);
      this.fullShiftMap.set(scheduleRef.id, sheetMap);
      scheduleRef.get().then((scheduleSnapshot: DocumentSnapshot<Schedule>) => this.scheduleMap.set(scheduleRef.id, scheduleSnapshot.data()));
    }
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(private locationService: LocationService, private route: ActivatedRoute, private afs: AngularFirestore) {
    this.route.params.pipe(
      switchMap((params: EmployeeRouteParams) => {
        this.employeeId = params.employeeId;
        return this.locationService.getCurrentLocation();
      }),
      switchMap((location: Location) => location.getEmployees()),
      map((employees: Map<string,Employee>) => employees.get(this.employeeId)),
      takeUntil(this.alive)
    ).subscribe((employee: Employee) => {
      this.employee = employee;
      this.findEmployeeShifts();
    });
  }
}

interface EmployeeRouteParams extends Params {
  employeeId: string;
}


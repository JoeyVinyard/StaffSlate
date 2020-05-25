import { Component, OnDestroy } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { takeUntil, switchMap, map, mergeMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from 'src/app/models/location';
import { ActivatedRoute, Params } from '@angular/router';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnDestroy{

  private alive: Subject<boolean> = new Subject<boolean>();
  public employee: Employee = {} as Employee;
  private employeeId: string;

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(private locationService: LocationService, private route: ActivatedRoute) {
    this.route.params.pipe(
      switchMap((params: EmployeeRouteParams) => {
        this.employeeId = params.employeeId;
        return this.locationService.getCurrentLocation();
      }),
      switchMap((location: Location) => location.getEmployees()),
      map((employees: Map<string,Employee>) => employees.get(this.employeeId))
    ).subscribe((employee: Employee) => {
      this.employee = employee;
    });
  }

}
class EmployeeRouteParams implements Params {
  employeeId: string;
}


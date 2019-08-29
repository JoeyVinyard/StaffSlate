import { Component } from '@angular/core';
import { Employee } from 'src/app/models/employee';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  employees: Employee[];

  dataSource = new MatTableDataSource<Employee>();
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'action'];

  manage(employee: Employee): void {
    console.log(employee);
  }

  constructor(private locationService: LocationService) {
    locationService.status.subscribe(() => {
      console.log("Finished");
    });
  }

}

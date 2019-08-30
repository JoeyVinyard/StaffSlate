import { Component } from '@angular/core';
import { Employee, DisplayedEmployee } from 'src/app/models/employee';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  dataSource = new MatTableDataSource<DisplayedEmployee>();
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'action'];

  manage(employee: DisplayedEmployee): void {
    console.log(employee);
  }

  constructor(private locationService: LocationService) {
    this.locationService.status.subscribe((fetched: boolean) => {
      if(fetched) {
        this.dataSource.data = Array.from(this.locationService.getCurrentLocation().employees).map((emp) => {
          return {
            firstName: emp[1].firstName,
            lastName: emp[1].lastName,
            email: emp[1].email,
            id: emp[0]
          } as DisplayedEmployee
        });
      }
    });
  }

}

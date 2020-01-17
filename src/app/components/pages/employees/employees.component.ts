import { Component, ViewChild } from '@angular/core';
import {  Employee } from 'src/app/models/employee';
import { MatTableDataSource, MatDialog, MatSnackBar, MatSelect } from '@angular/material';
import { LocationService } from 'src/app/services/location.service';
import { NewEmployeeDialogComponent } from './new-employee-dialog/new-employee-dialog.component';
import { Location } from 'src/app/models/location';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  dataSource = new MatTableDataSource<Employee>();
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'action'];
  loadedLocation: Location;

  private openNewEmployeeDialog(): void {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      width: '300px',
    });
    dialogRef.afterClosed().subscribe((employee: Employee) => {
      if(employee) {
        this.loadedLocation.addEmployee(employee)
        .then(() => this.addEmployeeResult(true))
        .catch(() => this.addEmployeeResult(false));
      }
    });
  }

  private addEmployeeResult(success: boolean): void {
    if (success) {
      this.snackbar.open("Employee succesfully added.", "Dismiss", {
        duration: 5000
      });
    } else {
      this.snackbar.open("Error adding employee, please try again later.", "Dismiss", {
        duration: 5000
      });
    }
  }
  
  private manage(employee: Employee): void {
    console.log(employee);
  }

  private delete(employee: Employee): void {
    this.loadedLocation.deleteEmployee(employee.id).then(() => {
        this.snackbar.open("Employee succesfully deleted.", "Dismiss", {
          duration: 5000
        });
    }).catch(() => {
      this.snackbar.open("Error deleting employee, please try again later.", "Dismiss", {
        duration: 5000
      });
    })
  }

  private parseEmployees(employees: Map<string, Employee>): void {
    this.dataSource.data = Array.from(employees.values());
    this.snackbar.dismiss();
  }

  private filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  constructor(private locationService: LocationService, private userService: UserService, public dialog: MatDialog, public snackbar: MatSnackBar) {
    this.snackbar.open("Loading Employees...", "Dismiss");
    this.locationService.getCurrentLocation().subscribe((location) => {
      this.loadedLocation = location;
      this.loadedLocation.getEmployees().subscribe(this.parseEmployees.bind(this));
    });
  }
}

import { Component } from '@angular/core';
import { DisplayedEmployee, Employee } from 'src/app/models/employee';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { LocationService } from 'src/app/services/location.service';
import { NewEmployeeDialogComponent } from './new-employee-dialog/new-employee-dialog.component';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  dataSource = new MatTableDataSource<DisplayedEmployee>();
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'action'];

  private openNewEmployeeDialog(): void {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      width: '300px',
    });
    dialogRef.afterClosed().subscribe((employee: Employee) => {
      if(employee) {
        this.locationService.addEmployeeToCurrentLocation(employee)
        .then(() => this.addEmployeeResult(true))
        .catch(() => this.addEmployeeResult(false));
      }
    });
  }
  
  private manage(employee: DisplayedEmployee): void {
    console.log(employee);
  }

  private parseEmployees(location: Location): void {
    this.dataSource.data = Array.from(location.employees).map((emp) => {
      return {
        firstName: emp[1].firstName,
        lastName: emp[1].lastName,
        email: emp[1].email,
        id: emp[0]
      } as DisplayedEmployee
    });
    this.snackbar.dismiss();
  }

  private addEmployeeResult(success: boolean): void {
    if(success) {
      this.snackbar.open("Employee succesfully added.", "Dismiss", {
        duration: 5000
      });
    } else {
      this.snackbar.open("Error adding employee, please try again later.", "Dismiss", {
        duration: 5000
      });
    }
  }

  private filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  constructor(private locationService: LocationService, public dialog: MatDialog, public snackbar: MatSnackBar) {
    this.snackbar.open("Loading Employees...", "Dismiss");
    this.locationService.getCurrentLocation().subscribe(this.parseEmployees.bind(this));
  }

}

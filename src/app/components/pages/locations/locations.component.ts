import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { Location } from 'src/app/models/location';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnDestroy {

  subscriptions: Subscription[] = [];
  dataSource = new MatTableDataSource<Location>();
  displayedColumns: string[] = ['label'];
  loadedLocation: Location;
  locations: [string, Location][];

  public openNewScheduleDialog(): void {
    // const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
    //   width: '300px',
    // });
    // this.subscriptions.push(dialogRef.afterClosed().subscribe((employee: Employee) => {
    //   if(employee) {
    //     this.loadedLocation.addEmployee(employee)
    //     .then(() => this.addEmployeeResult(true))
    //     .catch(() => this.addEmployeeResult(false));
    //   }
    // }));
  }

  private addScheduleResult(success: boolean): void {
    // if (success) {
    //   this.snackbar.open("Employee succesfully added.", "Dismiss", {
    //     duration: 5000
    //   });
    // } else {
    //   this.snackbar.open("Error adding employee, please try again later.", "Dismiss", {
    //     duration: 5000
    //   });
    // }
  }

  private parseLocations(locations: Map<string, Location>): void {
    this.dataSource.data = Array.from(locations.values());
    this.snackbar.dismiss();
  }

  public open(location: Location): void {
    console.log(location);
  }

  public filter(f: string): void {
    this.dataSource.filter = f.trim().toLowerCase();
  }

  public buttonContent(): string {
    return `New ${window.innerWidth > 800 ? "Location" : ""}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  constructor(private locationService: LocationService, public dialog: MatDialog, public snackbar: MatSnackBar) {
    this.snackbar.open("Loading Employees...", "Dismiss");
    this.subscriptions.push(this.locationService.getLocationsMap().subscribe((locations: Map<string,Location>) => {
      this.parseLocations(locations);
    }));
  }

}

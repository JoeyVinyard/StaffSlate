import { Component, ViewChild } from '@angular/core';
import { Employee } from 'src/app/models/employee';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  employees: Employee[];

  dataSource = new MatTableDataSource<Employee>();
  displayedColumns: string[] = ['firstName', 'lastName', 'action'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  manage(employee: Employee): void {
    console.log(employee);
  }

  constructor(private afStorage: AngularFirestore) {
    this.dataSource.paginator = this.paginator;

    // let col = afStorage.collection("employees");
    // this.employees.forEach((e) => {
    //   col.add(e);
    // })
  }

}

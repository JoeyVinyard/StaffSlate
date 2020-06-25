import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-mobile-employee-table',
  templateUrl: './mobile-employee-table.component.html',
  styleUrls: ['./mobile-employee-table.component.css']
})
export class MobileEmployeeTableComponent {
  @Input() dataSource: MatTableDataSource<[string, Employee]>;
  @Input() viewEmployee: (_:[string, Employee])=>void;
  @Input() openNewEmployeeDialog: (_?:[string, Employee])=>void;
  @Input() deleteEmployee: (_:[string, Employee])=>void;
  displayedColumns: string[] = ['firstName', 'lastName', 'action'];

  public truncate(text: string): string {
    let truncateLength = Math.floor(10*(window.innerWidth/320));
    if(text.length > truncateLength) {
      return `${text.substr(0,truncateLength)}...`;
    } else {
      return text;
    }
  }

  constructor() { }

}

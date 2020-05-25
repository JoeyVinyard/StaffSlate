import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-desktop-employee-table',
  templateUrl: './desktop-employee-table.component.html',
  styleUrls: ['./desktop-employee-table.component.css']
})
export class DesktopEmployeeTableComponent {

  @Input() dataSource: MatTableDataSource<[string, Employee]>;
  @Input() viewEmployee: (_:[string, Employee])=>void;
  @Input() openNewEmployeeDialog: (_?:[string, Employee])=>void;
  @Input() deleteEmployee: (_:[string, Employee])=>void;
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phone', 'action'];
  constructor() { }

}

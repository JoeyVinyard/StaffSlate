import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
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
  constructor() { }

}

import { Component, Input } from '@angular/core';
import { Identifier } from 'functions/src/types';
import { Shift } from 'src/app/models/shift';
import { Schedule } from 'src/app/models/schedule';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent {

  @Input() fullShiftMap: Map<string, Map<string, Shift[]>> = new Map();
  @Input() scheduleMap: Map<string, Schedule> = new Map();

  public getScheduleIds(): string[] {
    return Array.from(this.scheduleMap.keys());
  }

  public filterSheets(scheduleId: string, sheetArray: Identifier[]): Identifier[] {
    return sheetArray.filter((id: Identifier) => this.fullShiftMap.get(scheduleId).has(id.key));
  }

  public getShifts(scheduleId: string, sheetId: string): Shift[] {
    return this.fullShiftMap.get(scheduleId).get(sheetId);
  }

  constructor(public timeService: TimeService) { }

}

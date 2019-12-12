import { Time } from '@angular/common';

export interface Shift {
    startTime: Time;
    endTime: Time;
    empId: string;
    id: string
}

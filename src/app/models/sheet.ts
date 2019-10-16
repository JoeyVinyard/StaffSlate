import { Shift } from './shift';
import { Time } from '@angular/common';

export interface Sheet {
    label: string;
    timeIncrement: number;
    shifts: Shift[];
    openTime: Time;
    closeTime: Time;
}

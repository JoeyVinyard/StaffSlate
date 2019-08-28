import { Shift } from './shift';

export interface Sheet {
    label: string;
    timeIncrement: number;
    shifts: Shift[];
}

import { Shift } from './shift';

export interface Employee {
    firstName: string;
    lastName: string;
    shifts: Shift[];
}

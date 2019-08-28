import { Employee } from './employee';
import { Schedule } from './schedule';

export interface Location {
    employees: Employee[];
    schedules: Schedule[];
    name: string;
}

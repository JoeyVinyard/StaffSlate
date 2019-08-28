import { Employee } from './employee';
import { Schedule } from './schedule';

export interface Location {
    employees: Map<string, Employee>;
    schedules: Map<string, Schedule>;
    name: string;
}

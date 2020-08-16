import { Params } from '@angular/router';

export interface EmployeeRouteParams extends Params {
    employeeId: string;
}
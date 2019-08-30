export interface Employee {
    firstName: string;
    lastName: string;
    email: string;
}

export interface DisplayedEmployee extends Employee {
    id: string;
}
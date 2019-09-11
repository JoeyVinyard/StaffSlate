import { Sheet } from './sheet';

export interface Schedule {
    sheets: Map<string, Sheet>;
    label: string;
}

export interface DisplayedSchedule extends Schedule {
    id: string;
}
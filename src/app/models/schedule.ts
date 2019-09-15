import { Sheet } from './sheet';

export interface Schedule {
    sheets: Map<string, Sheet>;
    label: string;
    id: string;
}
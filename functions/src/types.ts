export interface PrintShift {
    startTime: Time;
    endTime: Time;
    empId: string;
}

export interface PrintSheet {
    label: string;
    shifts: PrintShift[];
    openTime: Time;
    closeTime: Time;
}

export interface PrintSchedule {
    sheetIds: Identifier[];
    sheets: PrintSheet[];
    timeIncrement: number;
}

export interface Time {
    hours: number,
    minutes: number
}

export interface Identifier {
    key: string,
    display: string
}
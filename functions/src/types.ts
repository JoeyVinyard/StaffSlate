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
    timeColumns: Time[];
    sheetIds: Identifier[];
    sheets: PrintSheet[];
}

export interface Time {
    hours: number,
    minutes: number
}

export interface Identifier {
    key: string,
    display: string
}
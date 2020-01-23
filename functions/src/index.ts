import * as functions from 'firebase-functions';
import * as uniqid from 'uniqid';
import { PrintSchedule, Time, PrintSheet, PrintShift, Identifier } from './types';
import { CallableContext } from 'firebase-functions/lib/providers/https';

const admin = require('firebase-admin');
admin.initializeApp();

const TABLE = "{{TABLE}}";
const SHEET_LABEL = "{{SHEET_LABEL}}"
const TIME_COLUMNS = "{{TIME_COLUMNS}}"
const TIME = "{{TIME}}"
const NAME = "{{NAME}}"
const FONT = "{{FONT}}"

export const createViewId = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}")
    .onCreate((snapshot, context) => {
        return snapshot.ref.set({"viewId": uniqid()}, {merge: true});
    });

export const exportSchedule = functions.https.onCall((data: PrintSchedule, context: CallableContext) => {
    let s = data.sheets[0];
    let id = data.sheetIds[0];

    let generatedHTML = exportSheet(s,id,data.timeIncrement);
    generatedHTML;

    return generatedHTML;
});

const exportSheet = (sheet: PrintSheet, id: Identifier, timeIncrement: number) => {
    let baseTable = "<html><body><table>{{TABLE}}</table></body><style>table{border:1px solid black;border-spacing:0;border-collapse:collapse;width:100%}table *{font-size:{{FONT}}px}th{border:1px solid black}td{border-bottom:1px solid black}.name{border:1px solid black}.left{border-right:1px solid black}.hbuffer{border:1px solid black;min-width:2px}.shaded{background-color:grey}.vbuffer .name,.vbuffer .hbuffer{border:1px solid black}</style></html>"

    let headerRow = "<tr><th>{{SHEET_LABEL}}</th><th class='hbuffer'></th>{{TIME_COLUMNS}}</tr>";
    let baseTimeColumn = "<th colspan=2>{{TIME}}</th>";
    let timeHeaders = "";

    let tc = generateTimeColumns(sheet, timeIncrement);
    tc.forEach((column: Time) => {
        timeHeaders += baseTimeColumn.replace(TIME, timeToString(column));
    });
    headerRow = headerRow.replace(FONT, tc.length > 32 ? "11" : "12");
    headerRow = headerRow.replace(SHEET_LABEL, id.display);
    headerRow = headerRow.replace(TIME_COLUMNS, timeHeaders);

    let shiftRows = sheet.shifts.map((shift: PrintShift) => {
        let s = "<tr><td class='name'>{{NAME}}</td><td class='hbuffer'></td>".replace(NAME, shift.empId);
        tc.forEach((t: Time) => {
            s += `<td class='left ${shouldShade(t,shift,true) ? "shaded" : ""}'></td><td class='${shouldShade(t,shift,false) ? "shaded" : ""}'></td>`
        })
        s += "</tr>";
        return s;
    });

    let shifts = shiftRows.join("<tr class='vbuffer'><td class='name'></td><td class='hbuffer'></td>" + tc.map(() => "<td class='left'></td><td class=''></td>").join("") + "</tr>");

    return baseTable.replace(TABLE, headerRow+shifts);
}

const convertTimeToNum = (t: Time) => {
    return t.hours*100 + t.minutes;
}

const shouldShade = (time: Time, shift: PrintShift, left: boolean) => {
    let convertedTime = convertTimeToNum(time);
    let convertedStart = convertTimeToNum(shift.startTime);
    let convertedEnd = convertTimeToNum(shift.endTime);
    return isInShift(convertedTime, convertedStart, convertedEnd)
    && (!left || (left && convertedTime != convertedStart))
    && (left || (!left && convertedTime != convertedEnd));
}

const isInShift = (time: number, start: number, end: number) => {
    return time >= start && time <= end;
}
  
const generateTimeColumns = (sheet: PrintSheet, timeIncrement: number) => {
    let s = sheet.openTime.hours + sheet.openTime.minutes/60;
    let e = sheet.closeTime.hours + sheet.closeTime.minutes/60;
    let numColumns = Math.floor(e-s+1)*(60/timeIncrement);
    let times: Time[] = [];
    let h = sheet.openTime.hours;
    let m = sheet.openTime.minutes;
    times.push(sheet.openTime);
    for(let i = 0; i < numColumns-1; i++) {
      m+= timeIncrement;
      if(m % 60 == 0) {
        m = 0;
        h++;
      }
      let t = {
        hours: h,
        minutes: m
      } as Time
      times.push(t);
    }
    return times;
  }

const timeToString = (time: Time, space: boolean = true) => {
    return `${time.hours == 12 || time.hours == 0 ? "12" : formatHour(time.hours%12)}:${time.minutes < 10 ? "0" + time.minutes : time.minutes}${space ? " " : ""}${time.hours>=12 ? "PM" : "AM"}`;
}

const formatHour = (h: number) => {
    return h < 10 ? " "+h : h;
}
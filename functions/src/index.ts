import * as functions from 'firebase-functions';
import * as uniqid from 'uniqid';
import { PrintSchedule, Time } from './types';

const admin = require('firebase-admin');
admin.initializeApp();

const TABLE = "{{TABLE}}";
const SHEET_LABEL = "{{SHEET_LABEL}}"
const TIME_COLUMNS = "{{TIME_COLUMNS}}"

export const createViewId = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}")
    .onCreate((snapshot, context) => {
        return snapshot.ref.set({"viewId": uniqid()}, {merge: true});
    });

export const exportSchedule = functions.https.onCall((data: PrintSchedule, context) => {
    let baseTable = "<html><body><table>{{TABLE}}</table></body><style>table{border-spacing:0;table-layout: fixed;border-collapse: collapse;}th{min-width: 50px;border: 1px solid black;}td{min-width: 50px;border-bottom: 1px solid black;}" +
                    ".name {border: 1px solid black;border-bottom: none;}.left {border-right: 1px solid black;}.hbuffer {border: 1px solid black;min-width: 2px;border-bottom: none;}.shaded {background-color: grey;}.vbuffer .name, .vbuffer .hbuffer {" +
                    "border: 1px solid black;}</style></html>"
    let headerRow = "<tr><th>{{SHEET_LABEL}}</th><th class='hbuffer'></th>{{TIME_COLUMNS}}</tr>"

    headerRow = headerRow.replace(SHEET_LABEL, data.sheetIds[0].display);
    headerRow = headerRow.replace(TIME_COLUMNS, "");
    let output = baseTable.replace(TABLE, headerRow);
    return output;
});

const timeToString = (time: Time, space: boolean = true) => {
    return `${time.hours == 12 || time.hours == 0 ? "12" : time.hours%12}:${time.minutes < 10 ? "0" + time.minutes : time.minutes}${space ? " " : ""}${time.hours>=12 ? "PM" : "AM"}`;
}
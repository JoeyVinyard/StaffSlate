import * as functions from 'firebase-functions';
import * as uniqid from 'uniqid';

const admin = require('firebase-admin');
admin.initializeApp();

export const createViewId = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}")
    .onCreate((snapshot, context) => {
        return snapshot.ref.set({"viewId": uniqid()}, {merge: true});
    });

export const deleteEmployeeShifts = functions.firestore.document("locations/{locationId}/employees/{employeeId}")
    .onDelete((snapshot, context) => {
        const location = snapshot.ref.parent.parent;
        const empId = snapshot.id;
        if(location) {
            return location.collection("schedules").listDocuments().then((scheduleRefs) => {
                scheduleRefs.forEach((scheduleRef) => {
                    scheduleRef.collection("sheets").listDocuments().then((sheetRefs) => {
                        sheetRefs.forEach((sheetRef) => {
                            sheetRef.collection("shifts").where("empId","==",empId).get().then((shifts) => {
                                shifts.forEach((shift) => {
                                    shift.ref.delete().then(() => {
                                        console.info(`Successfully deleted ${shift.id}`);
                                    }).catch((err) => {
                                        throw err;
                                    });
                                });
                            }).catch((err) => {
                                throw err;
                            });
                        });
                    }).catch((err) => {
                        throw err;
                    });
                });
            }).catch((err) => {
                throw err;
            });
        } else {
            return null;
        }
    });
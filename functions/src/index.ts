import * as functions from 'firebase-functions';
import * as uniqid from 'uniqid';

const admin = require('firebase-admin');
admin.initializeApp();

export const createViewId = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}")
    .onCreate((snapshot, context) => {
        return snapshot.ref.set({"viewId": uniqid()}, {merge: true});
    });
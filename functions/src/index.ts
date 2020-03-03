import * as functions from 'firebase-functions';
import * as uniqid from 'uniqid';

const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp();

const noreplyEmail: string = functions.config().noreply.email;
const noreplyClientId: string = functions.config().noreply.client_id;
const noreplyPrivateKey: string = functions.config().noreply.private_key.replace(new RegExp("\\\\n", "\g"), "\n");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: noreplyEmail,
        serviceClient: noreplyClientId,
        privateKey: noreplyPrivateKey
    }
});

transporter.verify().then(() => {
    console.log("Transporter successfully verified!");
}).catch(() => {
    console.error("Transporter could not verify");
})

export const createViewId = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}")
    .onCreate((snapshot, context) => {
        return snapshot.ref.set({"viewId": uniqid()}, {merge: true});
    });

export const inviteManager = functions.https
    .onCall((data) => {
        console.log(data.email, data.locationId);
        const mailOptions = {
            from: noreplyEmail,
            to: data.email,
            subject: "Test Message",
            text: "This is a test message"
        }

        return transporter.sendMail(mailOptions);
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
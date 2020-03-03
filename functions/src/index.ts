import * as functions from 'firebase-functions';
import * as uniqid from 'uniqid';

const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const serviceAccount = require('../key/serviceAccount.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://emsys-39a0f.firebaseio.com"
});
const db = admin.firestore();

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

        db.doc(`locations/${data.locationId}`).get().then((doc: any) => {
            console.log(doc.data());
        }).catch((err: any) => {
            console.error(err);
        })

        // sendEmail(data.email);
    });

// const sendEmail = (email: string, locationName: string) => {
//     const mailOptions = {
//         from: noreplyEmail,
//         to: email,
//         subject: `Invitation to manage ${locationName} on PicoStaff!`,
//         text: "This is a test message"
//     }

//     return transporter.sendMail(mailOptions);
// }

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
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
const auth = admin.auth();

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

export const removeManager = functions.https
    .onCall((data) => {
        return db.doc(`locations/${data.locationId}`).update({managers: admin.firestore.FieldValue.arrayRemove(data.email)});
    })

export const inviteManager = functions.https
    .onCall((data) => {
        return new Promise((res,rej) => {
            db.doc(`locations/${data.locationId}`).get().then((doc: any) => {
                addUser(data.email,data.locationId);
                auth.getUserByEmail(data.email).then(() => {
                    res(buildEmail(data.email, doc.data().label, false));
                }).catch((err: any) => {
                    if(err.code === `auth/user-not-found`) {
                        res(buildEmail(data.email, doc.data().label, true));
                    } else {
                        rej(err);
                    }
                })
            }).catch((err: any) => {
                rej(err);
            })
        })
    });

const addUser = (email: string, locationId: string) => {
    db.doc(`locations/${locationId}`).update({
        managers: admin.firestore.FieldValue.arrayUnion(email)
    });
}

const buildEmail = (email: string, locationName: string, newUser: boolean) => {
    if(newUser) {
        return sendEmail(email, locationName);
    } else {
        return new Promise((res,rej) => {
            db.doc(`users/${email}`).get().then((user: any) => {
                res(sendEmail(email,locationName,user));
            }).catch((err:any) => {
                rej(err);
            });
        });
    }
}

const sendEmail = (email: string, locationName: string, user: any = null) => {
    const mailOptions = {
        from: noreplyEmail,
        to: email,
        subject: `You've been invited to manage ${locationName} on PicoStaff!`,
        text: `Hello ${user && user.firstName ? user.firstName : email}\n\nYou have been invited to help manage ${locationName} on PicoStaff!`
            + "\n\n"
            + (user ? "You can log in at http://www.picostaff.com/login" :
                     `You can sign up for an account at: http://www.picostaff.com/register/${encodeURI(email)}`)
            + `\nOnce you log into your account, you will be able to access the location`
            + "\n\nHave a great day,\nPicoStaff Team\nhttp://www.picostaff.com/"
    }

    return transporter.sendMail(mailOptions);
}

export const onDeleteSchedule = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}")
    .onDelete((snapshot, context) => {
        const scheduleRef = snapshot.ref;
        const promises: Promise<any>[] = [];
        scheduleRef.collection("sheets").get().then((sheets: any) => {
            sheets.forEach((sheet: any) => {
                promises.push(deleteSheet(sheet.ref,true));
            });
        }).catch((err: any) => {
            return err;
        });
        return Promise.all(promises);
    });


export const onDeleteSheet = functions.firestore.document("locations/{locationId}/schedules/{scheduleId}/sheets/{sheetId}")
    .onDelete((snapshot, context) => {
        const sheetRef = snapshot.ref;
        return deleteSheet(sheetRef,false);
    });

const deleteSheet = (sheetRef: any, deleteDoc: boolean) => {
    const promises: Promise<any>[] = [];
    sheetRef.collection("shifts").get().then((shifts: any) => {
        shifts.forEach((shift: any) => {
            promises.push(shift.ref.delete());
        });
    }).catch((err: any) => {
        return err;
    })
    if(deleteDoc) {
        return new Promise((res,rej) => {
            Promise.all(promises).then(() => {
                res(sheetRef.delete());
            }).catch((err: any) => {
                rej(err);
            });
        });
    } else {
        return Promise.all(promises);
    }
}

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
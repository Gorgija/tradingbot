const admin = require("firebase-admin");
const serviceAccount = require("./trading-13-firebase-adminsdk.json");
const request = require('request');
const firebase = require("firebase");



    admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "https://trading-13.firebaseio.com"
    } ); //  , "gmailpausedmsgs"

/**
 * Triggered by a change to a Firebase RTDB reference.
 *
 * @param {!Object} event Event payload and metadata.
 * @param {!Function} callback Callback function to signal completion.
 */
exports.pausedGmailMsgs = (event, callback) => {
  console.log("Data from event: ", event.data)
  const db = admin.database();
  const triggerResource = event.resource;
  const pausedGmailMsgs = event.data;
  const url = "https://us-central1-trading-13.cloudfunctions.net/getGmailNewCryptoMsgs";

  if (pausedGmailMsgs != null) {
    const keysP = Object.keys(pausedGmailMsgs);

    keysP
      .map((key) => { console.log("KEy: " ,key);return pausedGmailMsgs[key] })
      .map((obj) => { console.log("Obj: " ,obj);return obj[Object.keys(obj)[0]] })
      .map((obj) => { console.log("Obj2: " ,obj);return obj[Object.keys(obj)[0]] })
      .map((data) => { console.log("Data: " ,data);data['data']['emailAddress'] = "me"; return data['data']; })
      .map((record) => { console.log("Record: " ,record);if(record != null) { sendingPausedHistoryIds(record);} });

    function sendingPausedHistoryIds(gmailData) {
      request.post(url, { form: gmailData }, (error, response, body) => {
        if (error) { return console.error('failed:', error); }
        db.ref('paused').set(null);
        console.log("Request Finished Successfuly, Response: \n", body);
      });
    }
  }

  callback();
};

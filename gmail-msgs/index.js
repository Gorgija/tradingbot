
const { google } = require('googleapis');
const credentials = require('./credentials.json');
const readline = require('readline');
const fs = require('fs');
const admin = require("firebase-admin");
const functions = require('firebase-functions');

var serviceAccount = require("./trading-13-firebase-adminsdk.json");

var config = {
    apiKey: "AIzaSyDpXsFzTBsI_jRZ70Tx3Vru7bD9imZYEZA",
    authDomain: "trading-13.firebaseapp.com",
    databaseURL: "https://trading-13.firebaseio.com",
    projectId: "trading-13",
    storageBucket: "trading-13.appspot.com",
    messagingSenderId: "231284354658"
};
// admin.initializeApp(config);
if(admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://trading-13.firebaseio.com"
  });

}

exports.getGmailNewCryptoMsgs = (request, response) => {

    // console.log(request.body);
    const email = request.body.emailAddress;
    const historyId = request.body.historyId;
    // console.log(email, " ", historyId)
    const CLIENT_ID = credentials.installed.client_id;
    const CLIENT_SECRET = credentials.installed.client_secret;
    const REDIRECT_URL = credentials.installed.redirect_uris;
    const TOKEN_PATH = 'token.json';
    const SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.metadata'
    ];
    const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URL[0]
    );
    fs.exists(TOKEN_PATH, (ext) => {
        if (ext) {
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) { console.log("Error at token reqirements...") }
                oAuth2Client.setCredentials(JSON.parse(token));
                // getCryptoMails(oAuth2Client);
                getHistoryIdMails(oAuth2Client, email, historyId);
            });
        } else {
            authorization();
        }
    });
    function authorization() {
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url:', url);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error('err');
                    console.log('Token stored to', TOKEN_PATH);
                });
                getHistoryIdMails(oAuth2Client, email, historyId);
            });
        });
    }
    //     status,statusText,headers,config,request,data   "Label_7426263213923419246"  21796673
    function getHistoryIdMails(auth, user, historyId) {
        const gmail = google.gmail({ version: 'v1', auth });
        const db = admin.database();


        gmail.users.history.list({
            userId: "me",
            startHistoryId: parseInt(historyId)
        }, (err, rsp) => {
            if (err) { console.log('Error happened at history: ', err) }
            //console.log(Object.keys(rsp));
            if(rsp.data.history) {
              	console.log("Crypto: " , rsp.data)
                db.ref('/crypto/' + historyId).once('value' , (snapshot) => {
                  console.log("Snapshot: " , snapshot.val())
                    if(!snapshot.val()) {
                        db.ref('/crypto/' + historyId).push({ "status": "crypto", "time": Date.now(), "data": rsp.data });
                        response.send({time:Date.now() , status : "toCrypto"});
                    }else{
                        response.send({time:Date.now() , status : "duplicate"});
                    }
                });
            } else {
              	console.log("Paused: " , rsp.data)
                  db.ref('/crypto/' + historyId).once('value' , (snapshot) => {
                    console.log("Snapshot: " , snapshot.val())
                    if(!snapshot.val()) {
                        db.ref('/paused/' + historyId).push({ "status": "crypto", "time": Date.now(), "data": rsp.data });
                        response.send({time:Date.now() , status : "toPaused"});
                    }else{
                        response.send({time:Date.now() , status : "duplicate"});
                    }
                });
            }
        });
    }
}




const { google } = require('googleapis');
const credentials = require('./credentials.json');
const readline = require('readline');
const fs = require('fs');

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
            getCryptoMails(oAuth2Client);
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
            // listLabels(oAuth2Client);
            getCryptoMails(oAuth2Client);
        });
    });
}


function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}

function getCryptoMails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list({
        userId: 'me',
        labelIds: [
            "Label_7426263213923419246",
            "Label_7810916382080190357",
            "Label_874305782631199814"
        ]
    },
        (err, resp) => {
            if (err) { console.log('Error happened...') }
            console.log(resp);
            const mails = resp.data;
            console.log(mails);
            response.status(200).send({ "return": "ok", "time": Date.now(), "data": mails });
        })

}
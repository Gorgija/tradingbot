const { google } = require("googleapis");
const fs = require('fs');
const readline = require('readline');

//  google trading-13 api key = AIzaSyDKKWp-GQy2wZAhc3WXYrY-R9FSas5YOOg
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly'
];

const TOKEN_PATH = 'token.json';

fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    console.log("Reading file credentials.json  ...")
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            console.log("Creating new Token...")
            return function (oAuth2Client) {
                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES,
                });
                console.log('Authorize this app by visiting this url:', authUrl);
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
                            if (err) return console.error(err);
                            console.log('Token stored to', TOKEN_PATH);
                        });
                        executeGmailAccount(oAuth2Client);
                    });
                });
            }(oAuth2Client)
        }
        console.log("Successfull Authentication!\nReading Gmail Crypto Messages...\n")
        oAuth2Client.setCredentials(JSON.parse(token));
        // executeGmailAccount(oAuth2Client);
        getCryptoMessages(oAuth2Client);
    });

    function executeGmailAccount(auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        gmail.users.labels.list({
            userId: 'me',
        }, (err, res) => {

            if (err) return console.log('The API returned an error: ' + err);
            const labels = res.data.labels;
            console.log('Labels: ', labels);

            if (labels.length) {

                console.log({ "time": Date.now(), "data": labels });
            } else {
                console.log('No labels found.');
                console.log({ "time": Date.now(), "data": {} })
            }
        });
    }

    function getCryptoMessages(auth) {
        const gmail = google.gmail({ version: 'v1', auth });

        gmailListCryptoMessagesIds(gmail)
            .then((res) => {
                // console.log(res.data);
                const msgsIdList = res.data.messages;
                msgsIdList.forEach(msgId => {
                    gmail.users.messages.get({
                        id: msgId.id, userId: 'me'
                    })
                        .then(res =>
                            console.log(
                                new Date(
                                    parseInt(res.data.internalDate)).toLocaleDateString(),
                                ":",
                                res.data.snippet.split(" ")[1],
                                ":",
                                res.data.snippet.split(":")[1]
                            )
                        );
                })
            })
    }

    function gmailListCryptoMessagesIds(gmail) {
        return gmail.users.messages.list({
            labelIds: ["Label_7426263213923419246"],
            q: 'is:unread',
            userId: 'georgievski.one@gmail.com'
        })
    }
});
// https://api.bitfinex.com/v1/pubticker/[ neousd | btcusd | xrpusd ]

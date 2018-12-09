const { google } = require("googleapis");
const fs = require('fs');
const readline = require('readline');

const SCOPES = [
  // 'https://www.googleapis.com/auth/gmail.readonly',
  // 'https://mail.google.com/',
  // 'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata'
];
const TOKEN_PATH = 'token.json';



exports.gmailStopWatchingLabels = (req, res) => {



  /** 
   * Read credentials.json file for project credentials data
   */
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), stopLabels);
  });


  /**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback) {
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
        callback(oAuth2Client);
      });
    });
  }
  /**
   * Puting watcher on specified labels in user email
   * @param {oAuth2Client} auth // "Label_5013450833909807651", "Label_7426263213923419246", "Label_7810916382080190357"
   *	  Label_7810916382080190357 = XRPUSD
   *      Label_5013450833909807651 = NEOUSD
   *      Label_7426263213923419246 = CRYPTO
   */
  function stopLabels(auth) {
    var gmail = google.gmail({ version: 'v1', auth });
    gmail.users.stop({"userId":"me",auth:auth},(err,response) => { res.status(200).send({"return":"ok","time":Date.now()}) } )
  }

}









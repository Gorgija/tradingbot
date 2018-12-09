const request = require("request");

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.cryptoTrader = (event, context) => {

  const pubsubMessage = event.data;
  const gmailData = pubsubMessage ? Buffer.from(pubsubMessage, 'base64').toString() : {};
  const parsed = JSON.parse(gmailData);

  console.log(gmailData);
  if (parsed.historyId) {
    var url = "https://us-central1-trading-13.cloudfunctions.net/getGmailNewCryptoMsgs";
    request.post(url, { form: JSON.parse(gmailData) }, (error, response, body) => {
      if (error) { return console.error('failed:', error); }
      console.log(body);
    })
  } else {
    console.log("Unknown data...");
  }

};

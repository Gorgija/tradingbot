const request = require('request-promise');
const urls = ["https://jsonplaceholder.typicode.com/todos/1","https://jsonplaceholder.typicode.com/todos/3"]
const promises = urls.map(url => request(url));

// BITFINEX
const BFX = require('bitfinex-api-node')
const bfx = new BFX({
    apiKey: '...',
    apiSecret: '...',
    ws: {
        autoReconnect: true,
        seqAudit: true,
        packetWDDelay: 10 * 1000
    }
})
const ws = bfx.ws()

ws.on('error', (err) => console.log(err))
ws.on('open', ws.auth.bind(ws))

ws.once('auth' , () => {
    console.log("Authenticated!");
});
ws.open();


// Promise.all(promises).then((data) => {
//     console.log(data);
// })

const WebSocket = require('ws')
const os = require('os')
require('dotenv').config()

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });
const clients = new Set();

// URL example: ws://my-server?token=my-secret-token
wss.on('connection', (ws, req) => {
    //console.log(req)
    console.log(`Client connected ${req.headers['sec-websocket-key']}`);

    // Check valid token (set token in .env as TOKEN=my-secret-token )
    const urlParams = new URLSearchParams(req.url.slice(1));
    if (urlParams.get('token') !== process.env.TOKEN) {
        console.log('Invalid token: ' + urlParams.get('token'));
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid token.'
        }));
        ws.close();
    }

    if (!clients.has(ws)) {
        clients.add(ws);
    }
    console.log(`Client count ${clients.size}`);

    ws.on('message', (message) => {
        console.log('Received message:', String(message));

        // Send a response back to the client along with some other info
        clients.forEach(client => {
            let msgString = String(message)

            if (client === ws) {
                msgString = `Message sent to ${clients.size} clients`
            };

            client.send(JSON.stringify({
                status: 0,
                msg: msgString
            }));
        })
        
    });

    ws.on('close', () => {
        clients.delete(ws)
        console.log('Client disconnected');
    });
});

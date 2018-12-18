// producer.js
const socket = require(`zeromq`).socket(`push`);
var counter = 0;
const address = process.env.ZMQ_PRODUCER_ADDRESS || `tcp://*:3000`;
const interval = process.env.ZMQ_PRODUCER_INTERVAL || 2000;

socket.bind(address, function(error){
    if (error) {
        logToConsole("Failed to bind socket: " + error.message);
        process.exit(0);
    }
    else {
        logToConsole("Server listening on port 9998");

        // Increment the counter and send the value to the clients every second.
        setInterval(function () { sendMessage(counter++); }, 1000);
    }
});

function logToConsole (message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function sendMessage (message) {
    logToConsole("Sending: " + message);
    socket.send(message);
}


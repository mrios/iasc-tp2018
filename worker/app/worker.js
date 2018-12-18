// worker.js
const socket = require(`zeromq`).socket(`pull`);
const address = process.env.ZMQ_WORKER_ADDRESS || `tcp://127.0.0.1:3000`;

function logToConsole (message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

// Add a callback for the event that is invoked when we receive a message.
socket.on("message", function (message) {
    // Convert the message into a string and log to the console.
    logToConsole("Received message: " + message.toString("utf8"));
});

// Connect to the server instance.
logToConsole("Connected to address: " + address);
socket.connect(address);

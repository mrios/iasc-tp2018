// publisher.js
var zmq = require('zeromq');
var socket = zmq.socket('pub');
const address = process.env.ZMQ_PRODUCER_ADDRESS || 'tcp://127.0.0.1:5556';
const interval = process.env.ZMQ_PRODUCER_INTERVAL || 2000;
socket.identity = 'publisher' + process.pid;
socket.connect(address);
var stocks = ['A', 'C'];
setInterval(function(){
	var symbol = stocks[Math.floor(Math.random()*stocks.length)];
	sendMessage(symbol + ' here is the info');
}, interval);

function logToConsole (message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function sendMessage (message) {
    logToConsole("Sending: " + message);
    socket.send(message);
}


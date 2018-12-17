// worker.js
const socket = require(`zeromq`).socket(`pull`);
const address = process.env.ZMQ_WORKER_ADDRESS || `tcp://127.0.0.1:3000`;

console.log(`Connecting to ${address}`);

socket.connect(address);
console.log(`Subscriber connected to address: ${address}`);

socket.on(`message`, function (msg) {
	console.log(`Message received: ${msg}`);
});
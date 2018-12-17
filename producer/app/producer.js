// producer.js
const socket = require(`zeromq`).socket(`push`);
const address = process.env.ZMQ_PRODUCER_ADDRESS || `tcp://*:3000`;
const interval = process.env.ZMQ_PRODUCER_INTERVAL || 2000;

console.log(`Producer bound to address: ${address}`);
socket.bindSync(address);

const sendMessage = function () {
	console.log('sending work');
  	socket.send('some work');
};

setInterval(sendMessage, interval);
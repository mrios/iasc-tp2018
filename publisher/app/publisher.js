// publisher.js
const socket = require(`zeromq`).socket(`pub`);
const address = process.env.ZMQ_PUB_ADDRESS || `tcp://*:3100`;
const interval = process.env.ZMQ_PUB_INTERVAL || 2000;

console.log(`Publisher bound to address: ${address}`);
socket.bindSync(address);

const sendMessage = function () {
	console.log('sending a multipart message envelope');
  	socket.send(['kitty cats', 'meow!']);
};

setInterval(sendMessage, interval);
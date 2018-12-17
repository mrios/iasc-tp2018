// subscriber.js
const socket = require(`zeromq`).socket(`sub`);
const address = process.env.ZMQ_PUB_ADDRESS || `tcp://127.0.0.1:3100`;
const topic = process.env.ZMQ_SUB_TOPIC || `kitty cats`;

console.log(`Subscriber bound to address: ${address}`);

socket.connect(address);
socket.subscribe(topic);
console.log(`Subscriber connected to address: ${address}, subscribed to topic: ${topic}`);

socket.on(`message`, function (topic, msg) {
	console.log(`received a message related to: ${topic}, containing message: ${msg}`);
});
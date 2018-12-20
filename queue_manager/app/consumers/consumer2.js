// consumer2.js
const zmq = require('zeromq');
const subscriber = zmq.socket('sub');
const port = 'tcp://*:5560';
  
subscriber.identity = 'subscriber2';
subscriber.connect(port);

subscriber.subscribe('B');
subscriber.subscribe('C');

subscriber.on('message', function(topic, msg) {
    console.log(`Subscriber2, Received Topic: ${topic}, msg: ${msg}`)
});
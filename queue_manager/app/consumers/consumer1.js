// consumer1.js
const zmq = require('zeromq');
const subscriber = zmq.socket('sub')
const port = 'tcp://*:5560';
  
subscriber.identity = 'subscriber1';
subscriber.connect(port);

subscriber.subscribe('A');

subscriber.on('message', function(topic, msg) {
    console.log(`Subscriber1, Received Topic: ${topic}, msg: ${msg}`)
});
// subscriber2.js
var zmq = require('zeromq');
var sock = zmq.socket('sub');

sock.identity = 'subscriber' + process.pid;
sock.connect('tcp://127.0.0.1:5555');
sock.subscribe('C');
sock.subscribe('D');
sock.on('message', function(data) {
 console.log(data.toString());
});
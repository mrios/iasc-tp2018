var zmq = require('zeromq');
var pubListener = 'tcp://127.0.0.1:5555';
var subListener = 'tcp://127.0.0.1:5556';
var hwm = 1000;
var verbose = 0;

var subSock = zmq.socket('xsub');
subSock.identity = 'subscriber' + process.pid;
subSock.bindSync(subListener);

var pubSock = zmq.socket('xpub');
pubSock.identity = 'publisher' + process.pid;
pubSock.setsockopt(zmq.ZMQ_SNDHWM, hwm);

pubSock.setsockopt(zmq.ZMQ_XPUB_VERBOSE, verbose);
pubSock.bindSync(pubListener);
subSock.on('message', (...args) => pubSock.send(args));
pubSock.on('message', function(data, bla) {
  var type = data[0]===0 ? 'unsubscribe' : 'subscribe';
  var channel = data.slice(1).toString();
  console.log(type + ':' + channel);
  subSock.send(data);
});
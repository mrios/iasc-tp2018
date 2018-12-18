var zmq = require('zeromq')
var subscriber = zmq.socket('sub')
zmq = require('zeromq')
  , port = 'tcp://127.0.0.1:12345';
  
var socket = zmq.socket('sub');

  socket.identity = 'subscriber' + process.pid;
  
  socket.connect(port);
  
  socket.subscribe('AAPL');
  socket.subscribe('GOOG');

  console.log('connected!');

  socket.on('message', function(data) {
    console.log(socket.identity + ': received data ' + data.toString());
  });
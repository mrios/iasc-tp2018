var cluster = require('cluster')
  , zmq = require('zeromq')
  , port = 'tcp://127.0.0.1:12346';



  //publisher = send only
  var socket = zmq.socket('pub');

  socket.identity = 'publisher' + process.pid;
  
  var stocks = ['AAPL', 'GOOG', 'YHOO', 'MSFT', 'INTC'];

  socket.bind(port, function(err) {
    if (err) throw err;
    console.log('bound!');
    
    setInterval(function() {
      var symbol = stocks[Math.floor(Math.random()*stocks.length)]
        , value = Math.random()*1000;

      console.log(socket.identity + ': sent ' + symbol + ' ' + value);
      socket.send(symbol + ' ' + value);
    }, 1000);
});
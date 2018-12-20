// publisher1.js
const zmq = require('zeromq')
const port = 'tcp://127.0.0.1:12345';
const socket = zmq.socket('pub');

socket.identity = 'publisher1';
const stocks = ['A', 'C'];

socket.bind(port, function(err) {
    if (err) throw err;
        console.log('bound!');

    setInterval(function() {
        const symbol = stocks[Math.floor(Math.random()*stocks.length)]
        , value = Math.random()*1000;
        console.log(socket.identity + ': sent ' + symbol + ' ' + value);
        socket.send([symbol, value]);
    }, 1000);
});
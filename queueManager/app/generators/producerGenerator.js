const zmq = require('zeromq');

class ProducerGenerator {
    constructor() {
    }

    init(config) {
        for (let index = 0; index < config.numProducers; index++) {
            this.createProducers(config, index);
        }
    }

    createProducers(configProducers, index) {
        const producer = zmq.socket(configProducers.mode);
        
        producer.identity = `Producer-${index}`;
        
        if(configProducers.mode === 'pub') {
            producer.connect(configProducers.host, function(err) {
                if (err) throw err;
                    console.log(`${producer.identity} bound to ${configProducers.host}!`);
            
                setInterval(function() {
                    const topic = this.getRandomTopic(configProducers.topics)
                    , value = Math.random()*1000;
                    console.log(socket.identity + ': sent ' + topic + ' ' + value);
                    socket.send([topic, value]);
                }, 1000);
            });
        }
        else {
            producer.connect(configProducers.host);
            producer.on('message', function(msg) {
                console.log(`Producer-${index}, msg: ${msg}`)
            });
        }

    }

    getRandomTopic(configProducers) {
        return configProducers.stocks[Math.floor(Math.random()*configProducers.stocks.length)]
    }
}

module.exports = ProducerGenerator;
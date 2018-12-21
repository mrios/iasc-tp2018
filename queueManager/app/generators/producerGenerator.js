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
            producer.connect(configProducers.host);
            console.log(`${producer.identity} bound to ${configProducers.host}!`);
        
            setInterval(() => {
                const topic = this.getRandomTopic(configProducers.topics)
                , value = Math.random()*1000;
                console.log(producer.identity + ': sent ' + topic + ' ' + value);
                producer.send([topic, value]);
            }, 1000);
        }
        else {
            producer.connect(configProducers.host);
            producer.on('message', function(msg) {
                console.log(`Producer-${index}, msg: ${msg}`)
            });
        }

    }

    getRandomTopic(topics) {
        return topics[Math.floor(Math.random()*topics.length)]
    }
}

module.exports = new ProducerGenerator();
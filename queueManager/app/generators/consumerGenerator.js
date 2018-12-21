const zmq = require('zeromq');

class ConsumerGenerator {
    constructor() {
    }

    init(config) {
        for (let index = 0; index < config.numConsumers; index++) {
            this.createConsumers(config, index);
        }
    }

    createConsumers(configConsumers, index) {
        const consumer = zmq.socket(configConsumers.mode);
        
        consumer.identity = `Consumer-${index}`;
        
        if(configConsumers.mode === 'sub') {
            consumer.connect(configConsumers.host);
            consumer.subscribe(this.getRandomTopic(configConsumers.topics));
            consumer.subscribe(this.getRandomTopic(configConsumers.topics));
            consumer.on('message', function(topic, msg) {
                console.log(`Consumer-${index}, Received Topic: ${topic}, msg: ${msg}`)
            });
        }
        else {
            consumer.connect(configConsumers.host);
            consumer.on('message', function(msg) {
                console.log(`Consumer-${index}, msg: ${msg}`)
            });
        }

    }

    getRandomTopic(topics) {
        return topics[Math.floor(Math.random()*topics.length)]
    }
}

module.exports = new ConsumerGenerator();
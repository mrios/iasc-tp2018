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
        const ackPubSock = zmq.socket('pub');
        consumer.identity = `Consumer-${index}`;
        
        if(configConsumers.mode === 'sub') {
            const topic = this.getRandomTopic(configConsumers.topics);
            consumer.connect(configConsumers.host);
            consumer.subscribe(topic);
			ackPubSock.connect(configConsumers.ackHost);
            consumer.on('message', function(topic, msg) {
				var jobId = msg.toString().substr(0,8);
				ackPubSock.send([topic, jobId + consumer.identity]);
                console.log(`Consumer-${index}, Received Topic: ${topic}, msg: ${msg}`);
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
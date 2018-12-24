const zmq = require('zeromq');
const chalk = require('chalk');

class ConsumerGenerator {
    constructor() {
    }

    init(config) {
        let cliColor = '';
        this.setCliColor(config.cliColor);
        for (let index = 0; index < config.numConsumers; index++) {
            this.createConsumer(config, index);
        }
    }

    setCliColor(color) {
        this.cliColor = color;
    }

    getCliColor(color) {
        return this.cliColor;
    }

    createConsumer(configConsumers, index) {
        const consumer = zmq.socket(configConsumers.mode);
        const ackPubSock = zmq.socket('pub');
        const reqSyncSock = zmq.socket('req');
        consumer.identity = `Consumer-${index}`;
        
        if(configConsumers.mode === 'sub') {
            const topic = this.getRandomTopic(configConsumers.topics);
            consumer.connect(configConsumers.host);
            consumer.subscribe(topic);

            // Parralel comunication for sync
            reqSyncSock.connect(configConsumers.reqHost);
            reqSyncSock.send([consumer.identity, topic]);

            // ACK pub socker
            ackPubSock.connect(configConsumers.ackHost);
            
            consumer.on('message', (topic, msg) => {
				const jobId = msg.toString().substr(0,8);
                this.log(`Sending ACK topic: ${topic}, jobId: ${jobId} consumerId: ${consumer.identity}`);
                ackPubSock.send([topic, jobId, consumer.identity]);
                this.log(`DONE! ${consumer.identity}, Received Topic: ${topic} and msg: ${msg}`);
            });
        }
        else {
            consumer.connect(configConsumers.host);
            consumer.on('message', (msg) => {
                this.log(`Consumer-${index}, msg: ${msg}`);
            });
        }

        // Handling Interrupt Signals
        process.on('SIGINT', () => {
            consumer.close();
            //ackPubSock.close();
            reqSyncSock.close();
            process.exit();
        });

    }

    getRandomTopic(topics) {
        return topics[Math.floor(Math.random()*topics.length)]
    }

    log(msg) {
        console.log(chalk.hex(this.getCliColor())(msg));
    }
}

module.exports = new ConsumerGenerator();
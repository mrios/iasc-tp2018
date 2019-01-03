const zmq = require('zeromq');
const chalk = require('chalk');

class ProducerGenerator {
    constructor() {
    }

    init(config) {
        let cliColor = '';
        this.setCliColor(config.cliColor);
        for (let index = 0; index < config.numProducers; index++) {
            this.createProducer(config, index);
        }
    }

    setCliColor(color) {
        this.cliColor = color;
    }

    getCliColor(color) {
        return this.cliColor;
    }

    createProducer(configProducers, index) {
        const producer = zmq.socket(configProducers.mode);
        producer.identity = `Producer-${index}`;
        
        if(configProducers.mode === 'pub') {
            producer.connect(configProducers.host);
            this.log(`${producer.identity} bound to ${configProducers.host}!`);
            setInterval(() => {
                const topic = this.getRandomTopic(configProducers.topics)
                , msg = `The magic number is: ${Math.random()*1000}`;
                this.log(`${producer.identity}: sent topic: ${topic}, msg: ${msg}`);
                producer.send([topic, msg]);
            }, configProducers.interval);
        }
        else {
            producer.connect(configProducers.host);
            producer.on('message', (msg) => {
                this.log(`Producer-${index}, msg: ${msg}`);
            });
        }

        // Handling Interrupt Signals
        process.on('SIGINT', () => {
            producer.close();
            process.exit();
        });

    }

    getRandomTopic(topics) {
        return topics[Math.floor(Math.random()*topics.length)]
    }

    log(msg) {
        console.log(chalk.hex(this.getCliColor())(`--| |>> ${msg}`));
    }
}

module.exports = new ProducerGenerator();
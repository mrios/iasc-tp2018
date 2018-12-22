const ServerAPI = require('./helpers/serverAPI.js');
const ServerArena = require('./helpers/serverArena.js');
const ConsumerGenerator = require('./generators/consumerGenerator.js');
const ProductorGenerator = require('./generators/producerGenerator.js');
const config = require('./config/config.js');
const arena = require('./config/arena.js');

class Main {
    constructor(config) {
        this.init(config);
    }

    init(config) {
        /*** Init Server API, It communicates with QueueManager ***/
        ServerAPI.init({
            serverAPI: config.serverAPI, 
            queue: config.pubSub,
            //queue: config.pushPull,
            cluster: config.cluster
        });

        /*** Init Arena Server ***/
        const sa = new ServerArena(arena);

        /*** Creates Consumers & Producers for Push/Pull ***/
        
        // ConsumerGenerator.init(config.pubSub.consumers);
        // ProductorGenerator.init(config.pubSub.productors);
        
        /*** Creates Consumers & Producers for Pub/Sub ***/
        ConsumerGenerator.init(config.pubSub.consumers);
        ProductorGenerator.init(config.pubSub.producers);
    }
}

new Main(config);
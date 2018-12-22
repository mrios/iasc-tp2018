const Queue = require('bee-queue');
const _ = require('lodash');
const zmq = require('zeromq');

class QueueManager {
    
    constructor() {}

    init(config) {
        let queueStore = [];
        let queueConfig = {};
        this.setQueuesStore([]);
        this.initProxy(config.queue.proxy);
        this.setQueueConfig(config.cluster.redis);
    }

    // Private methods
    initProxy(configProxy) {


        // Forwarder

        // When the frontend is a ZMQ_XSUB socket, and the backend is a ZMQ_XPUB socket, 
        // the proxy shall act as a message forwarder that collects messages from a set of publishers and forwards these to a set of subscribers. 
        // This may be used to bridge networks transports, e.g. read on tcp:// and forward on pgm://.
        // source: http://api.zeromq.org/4-2:zmq-proxy

        if(configProxy.mode === 'xsub/xpub') {

            // Create de xsub socket, identity and connect it
            var xsubSock = zmq.socket('xsub');
            xsubSock.identity = 'subscriber' + process.pid;
            xsubSock.bindSync(configProxy.subListener);

            // Create de xpub socket, identity and connect it
            var xpubSock = zmq.socket('xpub');
            xpubSock.identity = 'publisher' + process.pid;
            // Set Hight water mark: HWM,
            // This tells us how many messages we want ZeroMQ to buffer in RAM before blocking the 'pushing' socket.
            xpubSock.setsockopt(zmq.ZMQ_SNDHWM, configProxy.hwm);
            // Set Verbose mode,
            // This allow us enable/disable verbose tracing of commands and activity
            xpubSock.setsockopt(zmq.ZMQ_XPUB_VERBOSE, configProxy.verbose);
            xpubSock.bindSync(configProxy.pubListener);

            // Set Listener for xsub
            xsubSock.on('message', (topic, msg) => {

                // Store messages as jobs in the BeeQueue by topic, 1 topic <---> 1 beeQueue
                let beeQFound = this.findOneQueueBy({field: 'name', value: topic});
                if(!beeQFound) {
                    beeQFound = this.createQueue({name: topic});
                }
                this.createJob(beeQFound, msg);
				xpubSock.send([topic, msg]);
            });

            // Set Listener for xpub
            xpubSock.on('message', (data, bla) => {
                
                var type = data[0]===0 ? 'unsubscribe' : 'subscribe';
                var topic = data.slice(1).toString();
                console.log(`Type: ${type} : ${topic}`);
                xsubSock.send(data);
                //TODO quitar elemento de la cola
            }); 
        }
        else {
            console.log('...WIP...')
        }
    }

    getQueueConfig() {
        return this.queueConfig;
    }

    setQueueConfig(redis) {
        this.queueConfig = {
            prefix: 'bq',
            stallInterval: 5000,
            nearTermWindow: 1200000,
            delayedDebounce: 1000,
            redis: redis,
            isWorker: true,
            getEvents: true,
            sendEvents: true,
            storeJobs: true,
            ensureScripts: true,
            activateDelayedJobs: false,
            removeOnSuccess: false,
            removeOnFailure: false,
            redisScanCount: 100
        };
    }

    getQueuesStore() {
        return this.queueStore;
    }

    setQueuesStore(qs) {
        this.queueStore = qs;
    }

    addQ(q) {
        this.queueStore.push(q);
    }

    removeQ(name) {
        this.setQueuesStore(_.reject(this.getQueuesStore(), (o) => {
            return o.name === name;
        }));
    }

    // Public methods
    getStatus() {
        return {
            queues: this.findAllQueue()
        }
    }

    findAllQueue() {
        return this.getQueuesStore()
    }

    findOneQueueBy(filter) {
        return _.find(this.getQueuesStore(), (o) => {
            return o[filter.field] === filter.value;
        });
    }
    
    createQueue(data) {
        const newQueue = new Queue(data.name, this.getQueueConfig());
        this.addQ({name: data.name, beeQ: newQueue});
        return newQueue;
    }
    
    removeQueue(name) {
        this.removeQ(name);
        const found = this.findOneQueueBy({field: 'name', value: name});
        if(!_.isObject(found)) {
            return `Queue with name: ${name} deleted succesfully`
        }
        else {
            return `Queue with name: ${name} not found`
        }
        
    }

    createJob(beeQ, msg) {
        const job = beeQ.createJob({msg: msg});
        job
            .timeout(3000)
            .retries(2)
            .save()
            .then((job) => {
                // job enqueued, job.id populated
            });
    }
}

module.exports = new QueueManager();
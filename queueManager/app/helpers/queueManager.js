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

        if(configProxy.mode === 'xsub/xpub') {
            var subSock = zmq.socket('xsub');
            subSock.identity = 'subscriber' + process.pid;
            subSock.bindSync(configProxy.subListener);

            var pubSock = zmq.socket('xpub');
            pubSock.identity = 'publisher' + process.pid;
            pubSock.setsockopt(zmq.ZMQ_SNDHWM, configProxy.hwm);

            pubSock.setsockopt(zmq.ZMQ_XPUB_VERBOSE, configProxy.verbose);
            pubSock.bindSync(configProxy.pubListener);
            subSock.on('message', (data) => pubSock.send(data));
            pubSock.on('message', (data, bla) => {
                var type = data[0]===0 ? 'unsubscribe' : 'subscribe';
                var topic = data.slice(1).toString();

                let beeQFound = this.findOneQueueBy({field: 'name', value: topic});
                if(!beeQFound) {
                    beeQFound = this.createQueue({name: topic});
                }
                this.createJob(beeQFound, data);
                
                console.log(`Type: ${type} : ${topic}`);
                subSock.send(data);
            }); 
        }
        else {
            console.log('...WIP')
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
            queues: this.queueStore
        }
    }

    findAllQueue() {
        return {
            queues: this.getQueuesStore()
        }
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
            return `Queue with id: ${id} deleted succesfully`
        }
        else {
            return `Queue with id: ${id} not found`
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
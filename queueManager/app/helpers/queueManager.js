const Queue = require('bee-queue');
const _ = require('lodash');
const zmq = require('zeromq');
const chalk = require('chalk');

class QueueManager {
    
    constructor() {}

    init(config) {
        let cliColor = ''
        let queueStore = [];
        let queueConfig = {};
        this.setQueuesStore([]);
        this.setCliColor(config.queue.proxy.cliColor);
        this.initProxy(config.queue.proxy);
        this.setQueueConfig(config.cluster.redis);
    }

    setCliColor(color) {
        this.cliColor = color;
    }

    getCliColor(color) {
        return this.cliColor;
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
            const xsubSock = zmq.socket('xsub');
            xsubSock.identity = 'subscriber' + process.pid;
            xsubSock.bindSync(configProxy.subListener);

            // Create xpub socket, identity and connect
            const xpubSock = zmq.socket('xpub');
            xpubSock.identity = 'publisher' + process.pid;
            // Set Hight water mark: HWM,
            // This tells us how many messages we want ZeroMQ to buffer in RAM before blocking the 'pushing' socket.
            xpubSock.setsockopt(zmq.ZMQ_SNDHWM, configProxy.hwm);
            // Set Verbose mode,
            // This allow us enable/disable verbose tracing of commands and activity
            xpubSock.setsockopt(zmq.ZMQ_XPUB_VERBOSE, configProxy.verbose);
            xpubSock.bindSync(configProxy.pubListener);

            // Create rep sync socket, register consumer when sync
            const repSyncSock = zmq.socket('router');
            repSyncSock.bind(configProxy.repHost);
            
            repSyncSock.on('message', (generatedId, emptyDelimiter, consumer, topic) => {
                this.registerConsumer({
                    genId: generatedId.toString(),
                    consumer: consumer.toString('utf8'),
                    topic: topic.toString('utf8'),
                });
            });
			
            // Set Listener for xsub
            xsubSock.on('message', (topic, msg) => {
                // Store messages as jobs in the BeeQueue by topic, 1 topic <---> 1 beeQueue
                let beeQFound = this.findOneQueueBy({field: 'name', value: topic});
                if(!beeQFound) {
                    beeQFound = this.createQueue({name: topic.toString('utf8')});
                }
                this.createJob(beeQFound, msg.toString('utf8'), topic, xpubSock);
            });

            // Set Listener for xpub
            xpubSock.on('message', (data, bla) => { 
                const type = data[0]===0 ? 'unsubscribe' : 'subscribe';
                const topic = data.slice(1).toString();
                this.log(`Type: ${type}, topic: ${topic}`);
                
                // Add delay to store jobs
                setTimeout( ()=> {
                    xsubSock.send(data);
                }, configProxy.timeoutFordwarding)
                //TODO quitar elemento de la cola
            });

            // Create ack sub socket, subscribe to all topics and connect
			const ackSubSock = zmq.socket('sub');
			ackSubSock.subscribe('');
            ackSubSock.bind(configProxy.ackHost);
        
			// Set Listener for ACK Receiver
			ackSubSock.on('message', (topic, jobId, consumer) => {
				this.registerACK({
                    jobId: jobId.toString(),
                    consumer: consumer.toString('utf8'),
                    topic: topic.toString('utf8')
                })
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
        const found = this.findOneQueueBy({field: 'name', value: name});
        found.beeQ.destroy((err) => {
            if (!err) {
                console.log('Queue was destroyed');
            }
            this.removeQ(name);
            const foundAfterRemove = this.findOneQueueBy({field: 'name', value: name});
            if(!_.isObject(foundAfterRemove)) {
                return `Queue with name: ${name} deleted succesfully`
            }
            else {
                return `Queue with name: ${name} not found`
            }
        });
    }

	padJobId(jobId){
		return _.padStart(jobId, 8, '0');
    }

    unpadJobId(jobId){
		return jobId.substr(-4);
    }

    createJob(beeQ, msg, topic, xpubSock) {
        const job = beeQ.createJob({msg: msg});
        job
            .timeout(3000)
            .retries(2)
            .save()
            .then((job) => {
                // job enqueued, job.id populated
				const msgWithId =  this.padJobId(job.id) + msg;
				xpubSock.send([topic, msgWithId]);
            });

        job.on('progress', (progress) => {
            this.log(`Job ${job.id} reported progress: page ${progress.page} / ${progress.totalPages}`);
        });
    }

    registerConsumer({genId, consumer, topic}) {
        // TODO Register consumer for given topic in beeQ-manager
        this.log(`Consumer Registered`, [genId, consumer, topic]);
    }

    registerACK({jobId, consumer, topic}) {
        this.log(`ACK Registered`, [jobId, consumer, topic]);
        let found = this.findOneQueueBy({field: 'name', value: topic});

        if(found) {
            const data = {
                jobId: this.unpadJobId(jobId), 
                consumer: consumer, 
                beeQ: found.beeQ
            }

            this.markConsumedBy(data);
            if(this.canRemove(data)) {
                // TODO: process after check, this operation can be executed only once
                // data.beeQ.process(async (job) => {
                //     this.log(`Processing job ${job.id}, msg: ${job.data.msg}`);
                //     return job.data.msg;
                // });
                this.removeJob(data);
            }
        }
        else {
            this.log(`BeeQueue for topic: ${topic} not found!`);
        }

    }

    markConsumedBy({jobId, consumer, beeQ}) {
        // TODO: mark jobId consumed by consumer in beeQ-manager
        this.log(`The job: ${jobId} was consumed by: ${consumer}`);
    }

    canRemove({jobId, consumer, beeQ}) {
        // TODO: validate vs consumers by topic register
        return true;
    }

    removeJob({jobId, consumer, beeQ}) {
        beeQ.removeJob(jobId, (err) => {
            if (!err) {
              this.log(`Job ${jobId} was removed`, '#FF0000');
            }
        });
    }

    log(msg, color = null) {
        const hexa = _.isString(color) ? color : this.getCliColor();
        console.log(chalk.hex(hexa)(msg));
    }

}

module.exports = new QueueManager();
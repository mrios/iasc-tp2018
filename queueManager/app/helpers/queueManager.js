const Queue = require('bee-queue');
const _ = require('lodash');
const zmq = require('zeromq');

class QueueManager {
    
    constructor() {}

    init(config) {
        let queueStore = [];
        this.setQueuesStore([]);
        this.initProxy(config.proxy);
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
            subSock.on('message', (...args) => {
				if(!this.findOneQueueBy({field: 'name', value: args[0]}))
				{	
					this.createQueue({name: args[0]});
				}
				//TODO: Agregar mensaje args[1] a la cola {name: args[0]}
				pubSock.send(args)
			});
            pubSock.on('message', function(data, bla) {
                var type = data[0]===0 ? 'unsubscribe' : 'subscribe';
                var channel = data.slice(1).toString();
                console.log(type + ':' + channel);
                subSock.send(data);
				//TODO quitar elemento de la cola
            }); 
        }
        else {
            console.log('...WIP')
        }
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

    removeQ(id) {
        this.setQueuesStore(_.reject(this.getQueuesStore(), (o) => {
            return o.id === id;
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
        const newQueue = new Queue(data.name, {isWorker: false});
        //const newQueue = data;
        this.addQ(newQueue);
        return {
            queue: newQueue
        }
    }
    
    removeQueue(id) {
        this.removeQ(id);
        const found = this.findOneQueueBy({field: 'id', value: id});
        if(!_.isObject(found)) {
            return `Queue with id: ${id} deleted succesfully`
        }
        else {
            return `Queue with id: ${id} not found`
        }
        
    }
}

module.exports = new QueueManager();
const Queue = require('bee-queue');
const _ = require('lodash');
const zmq = require('zeromq');
  
//  Socket facing clients
var xsubProducers = zmq.socket('xsub');
//var xsubProducers = zmq.socket('router');
console.log('binding xsubProducers...');
//xsubProducers.bindSync('tcp://*:5559');
xsubProducers.bind('tcp://*:5559');

//  Socket facing services
var xpubClients = zmq.socket('xpub');
//var xpubClients = zmq.socket('dealer');
console.log('binding xpubClients...');
//xpubClients.bindSync('tcp://*:5560');
xpubClients.bind('tcp://*:5560');

//  Start the proxy
console.log('starting proxy...');
zmq.proxy(xpubClients, xsubProducers, null);

process.on('SIGINT', function() {
    xpubProducers.close();
    xpubClients.close();
})

class QueueManager {
    
    constructor() {
        let queueStore = [];
        this.setQueuesStore([]);
    }

    // Private methods
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
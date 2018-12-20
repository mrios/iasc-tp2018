const Queue = require('bee-queue');
const _ = require('lodash');
const zmq = require('zeromq');
const subscriber = zmq.socket('sub')
const port = 'tcp://127.0.0.1:12345';
  
subscriber.identity = 'subscriber' + process.pid;
subscriber.connect(port);

subscriber.subscribe('A');
subscriber.subscribe('B');
subscriber.subscribe('C');

subscriber.on('message', function(topic, msg) {
    console.log(`Topic: ${topic}, msg: ${msg}`)
});

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
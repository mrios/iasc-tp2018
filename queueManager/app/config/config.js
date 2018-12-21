module.exports = {
    // Server API REST
    serverAPI: {
        port: 4000
    },
    // Working mode pub/sub
    pubSub: {
        producers: {
            numProducers: 3,
            mode: 'pub',
            host: 'tcp://127.0.0.1:5556',
            topics: ['A', 'B', 'C']
        },
        consumers: {
            numConsumers: 3,
            mode: 'sub',
            host: 'tcp://127.0.0.1:5555',
            topics: ['A', 'B', 'C']
        },
        proxy: {
            mode: 'xsub/xpub',
            pubListener: 'tcp://127.0.0.1:5555',
            subListener: 'tcp://127.0.0.1:5556',
            hwm: 1000,
            verbose: 0
        }
    },
    // Working mode push/sull
    pushPull: {
        producers: {
            mode: 'req',
            host: 'tcp://'
        },
        consumers: {
            mode: 'rep',
            host: 'tcp://'
        },
        proxy: {
            input: {
                mode:'router',
                host: 'tcp://'
            },
            output: {
                mode:'dealer',
                host: 'tcp://'
            }
        }
    },
    // DB Cluster for bee-queue
    cluster: {
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
            options: {}
        },
        nodes: [
            {
                name: 'server1'
            },
            {
                name: 'server2'
            },
            {
                name: 'server3'
            }
        ]
    }
}
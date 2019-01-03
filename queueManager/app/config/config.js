module.exports = {
    // App version
    version: '0.1.0',
    // Server API REST
    serverAPI: {
        port: 4000
    },
    // Working mode pub/sub
    pubSub: {
        producers: {
            numProducers: 5,
            mode: 'pub',
            host: 'tcp://127.0.0.1:1556',
            topics: ['A', 'B', 'C'],
            interval: 1000,
            cliColor: '#00FFFF'
        },
        consumers: {
            numConsumers: 3,
            mode: 'sub',
            host: 'tcp://127.0.0.1:1555',
            topics: ['A', 'B', 'C'],
            reqHost: 'tcp://127.0.0.1:1558',
            ackHost: 'tcp://127.0.0.1:1559',
            cliColor: '#00FF00'
        },
        proxy: {
            mode: 'xsub/xpub',
            pubListener: 'tcp://127.0.0.1:1555',
            subListener: 'tcp://127.0.0.1:1556',
            hwm: 1000,
            verbose: 0,
            repHost: 'tcp://127.0.0.1:1558',
            ackHost: 'tcp://127.0.0.1:1559',
            timeoutFordwarding: 150,
            cliColor: '#FFFF00'
        }
    },
    // Working mode push/sull
    pushPull: {
        producers: {
            numProducers: 3,
            mode: 'push',
            host: 'tcp://127.0.0.1:1556',
            topics: ['A', 'B', 'C'],
            interval: 1000,
            cliColor: '#00FFFF'
        },
        consumers: {
            numConsumers: 3,
            mode: 'pull',
            host: 'tcp://127.0.0.1:1555',
            topics: ['A', 'B', 'C'],
            reqHost: 'tcp://127.0.0.1:1558',
            ackHost: 'tcp://127.0.0.1:1559',
            cliColor: '#00FF00'
        },
        proxy: {
            mode: 'router/dealer',
            routerListener: 'tcp://127.0.0.1:1555',
            dealerListener: 'tcp://127.0.0.1:1556',
            hwm: 1000,
            verbose: 0,
            repHost: 'tcp://127.0.0.1:1558',
            ackHost: 'tcp://127.0.0.1:1559',
            timeoutFordwarding: 150,
            cliColor: '#FFFF00'
        }
    },
    // DB Cluster for bee-queue
    cluster: {
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
            options: {}
        }
    },
    // Main cli-clor
    cliColor: '#0276FD'
}
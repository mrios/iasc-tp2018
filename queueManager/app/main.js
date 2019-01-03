const program = require('commander');
const _ = require('lodash');
const chalk = require('chalk');

const ServerAPI = require('./helpers/serverAPI.js');
const ServerArena = require('./helpers/serverArena.js');
const ConsumerGenerator = require('./generators/consumerGenerator.js');
const ProductorGenerator = require('./generators/producerGenerator.js');
const config = require('./config/config.js');
const arena = require('./config/arena.js');

class Main {
    constructor(config) {
        // Set cli-color
        let cliColor = ''
        this.setCliColor(config.cliColor);

        // Get params from cli
        program
            .version(config.version)
            .option('-m, --mode [type]', 'Define working mode for queue-manager, it could be "pubSub" or "pushPull"')
            .on('--help', function(){
                console.log('')
                console.log('Examples:');
                console.log('  node main.js -m pubSub');
                console.log('  node main.js --mode pubSub');
            })
            .parse(process.argv);

        if(_.isUndefined(program.mode)) {
            this.log(`You must enter a working mode via -m or --mode, it could be "pubSub" or "pushPull"`)
            process.exit(1);
        }
        else {
            if(!['pubSub', 'pushPull'].includes(program.mode)) {
                this.log(`You must enter a valid option for -m or --mode, it could be "pubSub" or "pushPull"`)
                process.exit(1);
            }
        }

        // Init main for working mode config
        this.init({
            ...config,
            queue: config[program.mode]
        }, program.mode);
    }

    setCliColor(color) {
        this.cliColor = color;
    }

    getCliColor(color) {
        return this.cliColor;
    }

    init(config, mode) {

        this.log(`- Main process : STARTING... [MODE=${mode}] [Ps=${config.queue.producers.numProducers}] [Cs=${config.queue.consumers.numConsumers}]`);

        /*** Init Server API, It communicates with QueueManager ***/
        ServerAPI.init(config);

        /*** Init Arena Server ***/
        const sa = new ServerArena(arena);

        /*** Creates Consumers & Producers for Pub/Sub or Push/Pull ***/
        ConsumerGenerator.init(config.queue.consumers);
        ProductorGenerator.init(config.queue.producers);

        this.log(`- Main process : STARTED!`)
    }

    log(msg, color = null) {
        const hexa = _.isString(color) ? color : this.getCliColor();
        console.log(chalk.hex(hexa)(msg));
    }
}

new Main(config);
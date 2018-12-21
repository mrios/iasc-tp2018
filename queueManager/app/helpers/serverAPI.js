let express = require('express');
let app = express();
let cors = require('cors');
let server = require('http').createServer(app);
const bodyParser = require('body-parser');
let _ = require('lodash');

const QueueManager = require('./queueManager.js');

const Server = {

  init: (config) => {

    // Config Server Format
	app.use(bodyParser.urlencoded({
        extended: true
    }));
	app.use(bodyParser.json());

    // Enable CORS
	app.use(cors());

	// Init Queue Manager
	QueueManager.init(config);

	/*********************/
	/*** HTTP API REST ***/
	/*********************/

	/*** General ***/

	// Get system status
	app.get('/api/status', (req, res) => {
		try {
			const status = QueueManager.getStatus();
			res.status(200).json(status);
		} catch (error) {
			console.log(`e: ${error}`)
			res.status(400).json({message: `Error trying to get status`, error: `${error}`});
		}
	});

	/*** MQs: Message Queue ***/

	// Get queues status
	app.get('/api/queue', (req, res) => {
		try {
			const queue = QueueManager.findAllQueue();
			res.status(200).json(queue);
		} catch (error) {
			console.log(`e: ${error}`)
			res.status(400).json({message: `Error trying to get queues`, error: `${error}`});
		}
	});

	// Get queues status for one queue by filter in body request
	app.get('/api/queue/:id', (req, res) => {
		try {
			const filter = {
				field: 'id', 
				value: req.params.id
			}
			const queue= QueueManager.findOneQueueBy(filter);
			if(_.isUndefined(queue)) {
				res.status(404).json({message: `Queue with id: ${filter.value} not found`});
			}
			else {
				res.status(200).json(queue);
			}
		} catch (error) {
			console.log(`e: ${error}`)
			res.status(400).json({message: `Error trying to get a queue by: ${filter}`, error: `${error}`});
		}
	});

	// Create a queue
	app.post('/api/queue', (req, res) => {
		try {
			const nweQueue= QueueManager.createQueue(req.body);
			res.status(200).json(newQueue);
		} catch (error) {
			console.log(`e: ${error}`)
			res.status(400).json({message: `Error trying to create a queue`, error: `${error}`});
		}
	});

	// Delete a queue
	app.delete('/api/queue/:id', (req, res) => {
		try {
			const resultado = QueueManager.removeQueue(req.params.id);
			res.status(200).json(resultado);
		} catch (error) {
			console.log(`e: ${error}`)
			res.status(400).json({message: `Error trying to delete a queue`, error: `${error}`});
		}
	});

    // Start server
    server.listen(config.serverAPI.port, () => {
    	console.log("Listening on port: %d", config.serverAPI.port);
    });
  }
};

module.exports = Server;
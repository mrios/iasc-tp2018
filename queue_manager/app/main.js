let port = 4000;
let express = require('express');
let app = express();
let cors = require('cors');
let server = require('http').createServer(app);
const bodyParser = require('body-parser');
let _ = require('lodash');

const QueueManager = require('./queue_manager.js');

const Server = {

  init: () => {

    // Config Server Format
	app.use(bodyParser.urlencoded({
        extended: true
    }));
	app.use(bodyParser.json());

    // Enable CORS
	app.use(cors());

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
			const colas = QueueManager.findAllQueue();
			res.status(200).json(colas);
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
			const cola = QueueManager.findOneQueueBy(filter);
			if(_.isUndefined(cola)) {
				res.status(404).json({message: `Queue with id: ${filter.value} not found`});
			}
			else {
				res.status(200).json(cola);
			}
		} catch (error) {
			console.log(`e: ${error}`)
			res.status(400).json({message: `Error trying to get a queue by: ${filter}`, error: `${error}`});
		}
	});

	// Create a queue
	app.post('/api/queue', (req, res) => {
		try {
			const nuevaCola = QueueManager.createQueue(req.body);
			res.status(200).json(nuevaCola);
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
    server.listen(port, () => {
    	console.log("Listening on port: %d", port);
    });
  }
};

Server.init();

module.exports = Server;
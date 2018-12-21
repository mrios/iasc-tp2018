const Arena = require('bull-arena');

const express = require('express');
const router = express.Router();

class ServerArena {
    
    constructor(config) {
        this.init(config);
    }

    init(config) {
        console.log('---- Arena init ----', config);
        const arena = Arena(config);
        router.use('/arena', arena);
    }
}

module.exports = ServerArena;


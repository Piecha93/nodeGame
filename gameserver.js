var Game = require('./public/javascripts/logic/gamelogic');

var game;

var tickrate = 64;
var clients = [];

//start server
function startGameServer() {
    
    game = new Game();
    game.startGameLoop();
    
    //start update loop
    updateLoop();
    console.log('Gameserver started');
}

//new client connected
function clientConnected(client) {
    clients.push(client);

    console.log('New client connected. id: ' + client.id);
    console.log('Clients connected(' + clients.length + '):');
    clients.forEach(function (c) {
        console.log(c.id);
    });
    game.newPlayer(client.id);
}

//client disconnected
function clientDisconected(client) {
    var indexToRemove = clients.indexOf(client);
    clients.splice(indexToRemove, 1);

    console.log('Client disconnected');
    console.log('Clients connected(' + clients.length + '):');
    clients.forEach(function (c) {
        console.log(c.id);
    });
    game.removePlayer(client.id);
};

//serverUpdateLoop all clients
function updateLoop() {
    for (var key in game.players) {
        // game.players[key].x = Math.random() * 500;
        // game.players[key].y = Math.random() * 500;
    }

    clients.forEach(function (c) {
        c.timeOutTime -= 1 / tickrate;
        if (c.timeOutTime < 0) {
            clientDisconected(c);
        } else {
            c.emit('serverUpdate', {players: game.players});
        }
    });
    //console.log(game.players);

    setTimeout(updateLoop, 1/tickrate * 1000);
    //console.log('updating clients' + new Date().getTime());
};

function handleClientInput(id, input) {
    //console.log('client: ' + id + ' sent: ' + input);
    game.players[id].input = input;
}

module.exports.clientConnected = clientConnected;
module.exports.clientDisconected = clientDisconected;
module.exports.startGameServer = startGameServer;
module.exports.handleClientInput = handleClientInput;

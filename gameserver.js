var Game = require('./public/javascripts/logic/gamelogic');

var game;

var updateTickRate = 20;
var clients = [];
var socket = null;
var update = {
    players: {},
    disconnectedClients: [],
    isEmpty: true
};

//start server
function startGameServer(sock) {
    socket = sock;
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
    for (var key in game.players) {
        update.players[key] = game.players[key].getUpdateInfo();
    }

    update.isEmpty = false;

}

//client disconnected
function clientDisconnected(client) {
    var indexToRemove = clients.indexOf(client);
    if (indexToRemove != -1) {
        clients.splice(indexToRemove, 1);

        console.log('Client disconnected');
        console.log('Clients connected(' + clients.length + '):');
        clients.forEach(function (c) {
            console.log(c.id);
        });
        game.removePlayer(client.id);
        update.disconnectedClients.push(client.id);
        update.isEmpty = false;
    }
};

//serverUpdateLoop all clients
function updateLoop() {
    //check if client not timeout
    clients.forEach(function (c) {
        c.timeOutTime -= 1 / updateTickRate;
        if (c.timeOutTime < 0) {
            clientDisconnected(c);
        }
    });

    //get players who need update
    for (var key in game.players) {
        if (game.players[key].isChanged) {
            update.players[key] = game.players[key].getUpdateInfo();
            game.players[key].isChanged = false;
            update.isEmpty = false;
        }
    }

    //if update is not empty send it to clients
    if (!update.isEmpty) {
        socket.emit('serverUpdate', update);
        update = {
            players: {},
            disconnectedClients: [],
            isEmpty: true
        };
    }

    //set next update time
    setTimeout(updateLoop, 1 / updateTickRate * 1000);
};

function handleClientInput(id, input) {
    //console.log('client: ' + id + ' sent: ' + input);
    game.players[id].input = input;
}

module.exports.clientConnected = clientConnected;
module.exports.clientDisconected = clientDisconnected;
module.exports.startGameServer = startGameServer;
module.exports.handleClientInput = handleClientInput;

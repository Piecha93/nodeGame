var Game = require('./public/javascripts/logic/game/gamelogic');

function GameServer(id) {
    this.game = null;
    this.serverId = id;
    this.updateTickRate = 25;
    this.clients = [];
    this.update = {
        players: {},
        disconnectedClients: [],
        isEmpty: true
    };
}

//start game server
GameServer.prototype.startGameServer = function () {
    this.game = new Game();
    this.game.startGameLoop();

    //start update loop
    this.updateLoop();
    console.log('Game server ' + this.serverId + ' started');
};

//new client connected
GameServer.prototype.clientConnected = function (client) {
    this.clients.push(client);

    console.log('New client connected. id: ' + client.id);
    console.log('Clients connected(' + this.clients.length + '):');
    this.clients.forEach(function (c) {
        console.log(c.id);
    });

    this.game.newPlayer(client.id);
    for (var key in this.game.players) {
        this.update.players[key] = this.game.players[key].getUpdateInfo();
    }

    this.update.isEmpty = false;

};

//client disconnected
GameServer.prototype.clientDisconnected = function (client) {
    var indexToRemove = this.clients.indexOf(client);
    if (indexToRemove != -1) {
        this.clients.splice(indexToRemove, 1);

        console.log('Client disconnected');
        console.log('Clients connected(' + this.clients.length + '):');
        this.clients.forEach(function (c) {
            console.log(c.id);
        });
        this.game.removePlayer(client.id);
        this.update.disconnectedClients.push(client.id);
        this.update.isEmpty = false;
    }
};

//serverUpdateLoop all clients
GameServer.prototype.updateLoop = function () {
    var self = this;
    this.clients.forEach(function (c) {
        c.timeOutTime -= 1 / self.updateTickRate;
        //check if client not timeouted
        if (c.timeOutTime < 0) {
            self.clientDisconnected(c);
        }
    });

    //get players who need update
    for (var key in this.game.players) {
        if (this.game.players[key].isChanged) {
            this.update.players[key] = this.game.players[key].getUpdateInfo();
            this.game.players[key].isChanged = false;
            this.update.isEmpty = false;
        }
    }

    //if update is not empty send it to clients
    if (!this.update.isEmpty) {
        this.clients.forEach(function (c) {
            c.emit('serverUpdate', self.update);
        });
        //this.socket.emit('serverUpdate', this.update);
        this.update = {
            players: {},
            disconnectedClients: [],
            isEmpty: true
        };
    }

    //set next update time
    setTimeout(function () {
        self.updateLoop();
    }, 1 / this.updateTickRate * 1000);
};

GameServer.prototype.handleClientInput = function (id, input) {
    //console.log('client: ' + id + ' sent: ' + input);
    var player = this.game.getPlayer(id);
    if (player != null)
        player.input = input;
};

module.exports = GameServer;
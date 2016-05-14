var Game = require('./public/javascripts/logic/game/gamelogic');

function GameServer(id) {
    //number of client updates per secound
    this.updateTickRate = 2000;
    this.serverId = id;

    this.gameLogic = null;
    this.messageBox = null;
    this.clients = [];
    this.update = {};
    this.clearUpdate();
}

GameServer.prototype.clearUpdate = function () {
    this.update = {
        players: {},
        message: null,
        disconnectedClients: [],
        isEmpty: true
    };
};

//start game server
GameServer.prototype.startGameServer = function () {
    this.gameLogic = new Game();
    this.gameLogic.startGameLoop();

    //start update loop
    this.updateLoop();
    console.log('Game server ' + this.serverId + ' started with id ' + this.serverId);
};

//new client connected
GameServer.prototype.clientConnected = function (client) {
    this.clients.push(client);

    console.log('New client connected. id: ' + client.id);
    console.log('Clients connected(' + this.clients.length + '):');
    this.clients.forEach(function (c) {
        console.log(c.id + ' ' + c.name);
    });

    var newPlayer = this.gameLogic.newPlayer(client.id);
    newPlayer.name = client.name;
    for (var key in this.gameLogic.players) {
        this.update.players[key] = this.gameLogic.players[key].getUpdateInfo();
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
            console.log(c.id + ' ' + c.name);
        });
        this.gameLogic.removePlayer(client.id);
        this.update.disconnectedClients.push(client.id);
        this.update.isEmpty = false;
    }
};

//serverUpdateLoop all clients
GameServer.prototype.updateLoop = function () {
    var self = this;
    //check if client not timeouted
    this.clients.forEach(function (c) {
        c.timeOutTime -= 1 / self.updateTickRate;
        if (c.timeOutTime < 0) {
            self.clientDisconnected(c);
        }
    });

    //get players who need update
    for (var key in this.gameLogic.players) {
        if (this.gameLogic.players[key].isChanged) {
            this.update.players[key] = this.gameLogic.players[key].getUpdateInfo();
            this.gameLogic.players[key].isChanged = false;
            this.update.isEmpty = false;
        }
    }

    //if update is not empty send it to clients
    if (!this.update.isEmpty) {
        this.clients.forEach(function (c) {
            c.emit('serverupdate', self.update);
        });
        this.clearUpdate();
    }

    //set next update time
    setTimeout(function () {
        self.updateLoop();
    }, 1 / this.updateTickRate * 1000);
};

GameServer.prototype.handleClientInput = function (id, input) {
    //console.log('client: ' + id + ' sent: ' + input);
    var player = this.gameLogic.getPlayer(id);
    if (player != null) {
        player.input = input;
    }
};

GameServer.prototype.handleClientAngle = function (id, angle) {
    var player = this.gameLogic.getPlayer(id);
    if (player != null) {
        player.body.angle = angle;
        player.isChanged = true;
    }
};

GameServer.prototype.sendMessageToAll = function (message) {
    // console.log('przyszla wiadomosc ' + message.content + ' dddddddddddd ');
    //console.log('client: ' + id + ' sent: ' + input);
    this.clients.forEach(function (c) {
        c.emit('servermessage', message);
    });
};

module.exports = GameServer;
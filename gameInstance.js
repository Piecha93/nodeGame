var Game = require('./public/javascripts/logic/game/gamelogic');

function GameServer(id, mapName) {
    //number of client updates per secound
    this.updateTickRate = 18;
    this.serverId = id;

    this.gameLogic = null;
    this.messageBox = null;
    this.clients = [];
    this.update = {};
    this.clearUpdate();

    this.mapName = mapName;
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
GameServer.prototype.startGameServer = function (portalEvent) {
    this.gameLogic = new Game();
    this.gameLogic.portalEvent = portalEvent;
    this.gameLogic.createMap(this.mapName);
    this.gameLogic.startGameLoop();

    //start update loop
    this.updateLoop();
    console.log('Game server ' + this.serverId + ' started with id ' + this.serverId);
};

//new client connected
GameServer.prototype.clientReady = function (client) {
    this.clients.push(client);
    var newPlayer = this.gameLogic.newPlayer(client.name);
    newPlayer.name = client.name;

    for (var key in this.gameLogic.players) {
        this.update.players[key] = this.gameLogic.players[key].getAllUpdateInfo();
    }

    this.update.isEmpty = false;
};

//client disconnected
GameServer.prototype.clientLeft = function (client) {
    var indexToRemove = this.clients.indexOf(client);
    if (indexToRemove != -1) {
        this.clients.splice(indexToRemove, 1);

        this.gameLogic.removePlayer(client.name);
        this.update.disconnectedClients.push(client.name);
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
            self.clientLeft(c);
        }
    });

    //get players who need update
    for (var key in this.gameLogic.players) {
        var updateInfo = this.gameLogic.players[key].getUpdateInfo();
        //check if update info is not empty
        if (Object.keys(updateInfo).length > 0) {
            this.update.players[key] = updateInfo;
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

GameServer.prototype.handleClientInput = function (name, input) {
    //console.log('client: ' + id + ' sent: ' + input);
    var player = this.gameLogic.getPlayer(name);
    if (player != null) {
        player.input = input;
    }
};

GameServer.prototype.handleClientAngle = function (name, angle) {
    var player = this.gameLogic.getPlayer(name);
    if (player != null) {
        player.angle = angle;
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
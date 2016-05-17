var p2 = require('p2');
var Player = require('./player');
var DeltaTimer = require('./detlatimer');
var Map = require('./map');

function Game() {
    this.tickRate = 64;

    this.players = {};
    this.renderHandler = null;
    this.timer = new DeltaTimer();
    this.physicsWorld = new p2.World({
        gravity: [0, 0]
    });

    this.map = null;
}

Game.prototype.startGameLoop = function () {
    this.gameLoop();
};

Game.prototype.gameLoop = function () {
    var delta = this.timer.getDelta();
    console.log(delta);
    this.handleInput();
    this.update(delta);
    this.render(delta);

    var self = this;
    setTimeout(function () {
        self.gameLoop();
    }, 1 / this.tickRate * 1000);
};

Game.prototype.handleInput = function () {
    for (var key in this.players) {
        this.players[key].handleInput();
    }
};

Game.prototype.update = function (delta) {
    //update players
    for (var key in this.players) {
        this.players[key].update(delta);
    }

    this.physicsWorld.step(1 / 60, delta / 1000, 20);
};

Game.prototype.render = function (delta) {
    if (this.renderHandler != null) {
        this.renderHandler.update(delta);
    }
};

Game.prototype.setRender = function (render) {
    this.renderHandler = render;
};

Game.prototype.createMap = function (mapName) {
    this.map = new Map(mapName, this.physicsWorld);
};

//creates new player
Game.prototype.newPlayer = function (id, playerCopy) {
    var player = new Player();
    player.id = id;

    //create physics elements
    var body = new p2.Body({
        position: [400, 300],
        mass: 1,
        damping: 1,
        angularDamping: 1
    });

    var shape = new p2.Circle({
        radius: 16
    });
    body.addShape(shape);
    player.body = body;

    if (playerCopy != null) {
        player.body.position = playerCopy.position;
        player.name = playerCopy.name;
    }

    this.physicsWorld.addBody(body);
    this.players[player.id] = player;
    return player;
};

Game.prototype.removePlayer = function (id) {
    delete this.players[id];
};

Game.prototype.getPlayer = function (id) {
    if (this.players[id] != undefined) {
        return this.players[id];
    }
    return null;
};

module.exports = Game;

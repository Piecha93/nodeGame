var p2 = require('p2');
var Player = require('./player');
var DeltaTimer = require('./detlatimer');
var Map = require('./map');

function Game() {
    this.tickRate = 64;
    this.gameLoopTimeout = null;
    this.players = {};
    this.physicsWorld = null;
    this.renderHandler = null;
    this.players = {};
    this.timer = null;

    this.reset();

    //events
    this.portalEvent = null;
}

Game.prototype.startGameLoop = function () {
    this.gameLoop();
    this.gameLoopTimeout = setTimeout(this.startGameLoop.bind(this), 1 / this.tickRate * 1000);
};

Game.prototype.gameLoop = function () {
    var delta = this.timer.getDelta();
    delta = (delta < 45) ? delta : 45;

    this.handleInput();
    this.update(delta);
    this.render(delta);
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

Game.prototype.reset = function () {
    this.players = {};
    this.timer = new DeltaTimer();

    if (this.physicsWorld != null) {
        this.physicsWorld.clear();
    } else {
        this.physicsWorld = new p2.World({
            gravity: [0, 0]
        });
    }

    if (this.gameLoopTimeout != null) {
        clearTimeout(this.gameLoopTimeout);
        this.gameLoopTimeout = null;
    }

    if (this.map != null) {
        this.map.destroy();
    }
    this.map = null;

    var self = this;
    this.physicsWorld.on("beginContact", function (event) {
        if (self.portalEvent == null) {
            return;
        }

        for (var i = 0; i < self.map.portalSensors.length; i++) {
            var body = null;
            if (event.bodyA == self.map.portalSensors[i]) {
                body = event.bodyB;
            } else if (event.bodyB == self.map.portalSensors[i]) {
                body = event.bodyA;
            }
            if (body == null) {
                continue;
            }
            for (var key in self.players) {
                if (self.players[key].body == body) {
                    self.portalEvent(self.players[key].name);
                }
            }
        }
    });
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
Game.prototype.newPlayer = function (name) {
    var player = new Player();
    player.name = name;

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

    this.physicsWorld.addBody(body);
    this.players[player.name] = player;
    return player;
};

Game.prototype.removePlayer = function (name) {
    this.physicsWorld.removeBody(this.players[name].body);
    delete this.players[name];
};

Game.prototype.getPlayer = function (name) {
    if (this.players[name] != undefined) {
        return this.players[name];
    }
    return null;
};

module.exports = Game;

var Player = require('./player');
var DeltaTimer = require('./detlatimer');

function Game() {
    this.tickRate = 128;
    
    this.players = {};
    this.renderHandler = null;
    this.timer = new DeltaTimer();
}

Game.prototype.startGameLoop = function () {
    this.gameLoop();
};

Game.prototype.gameLoop = function () {
    var delta = this.timer.getDelta();
    this.handleInput(delta);
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
};

Game.prototype.render = function (delta) {
    if (this.renderHandler != null) {
        this.renderHandler.update(delta);
    }
};

Game.prototype.setRender = function (render) {
    this.renderHandler = render;
};

//creates new player
Game.prototype.newPlayer = function (id, playerCopy) {
    var player = new Player();
    player.id = id;

    if (typeof playerCopy !== "undefined") {
        player.x = playerCopy.x;
        player.y = playerCopy.y;
        player.name = playerCopy.name;
    }
    this.players[player.id] = player;

    return player;
};

Game.prototype.removePlayer = function (id) {
    delete this.players[id];
};

Game.prototype.setTickRate = function (tr) {
    this.tickRate = tr;
};

Game.prototype.getTickRate = function () {
    return this.tickRate;
};

Game.prototype.getPlayer = function (id) {
    if (this.players[id] != undefined) {
        return this.players[id];
    }
    return null;
};

module.exports = Game;

var Player = require('./player');
var DeltaTimer = require('./detlatimer');

var timer = new DeltaTimer();

var tickRate = 128;

function Game() {
    this.players = {};
    this.renderHandler = null;
}

Game.prototype.startGameLoop = function () {
    gameLoop(this);
};

function gameLoop(self) {
    var delta = timer.getDelta();
    self.handleInput(delta);
    self.update(delta);
    self.render(delta);

    setTimeout(function () {
        gameLoop(self);
    }, 1 / tickRate * 1000);
};

Game.prototype.handleInput = function (delta) {
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
}

//creates new player
Game.prototype.newPlayer = function (id, newPlayer) {
    var player = new Player();
    player.id = id;

    if (typeof newPlayer !== "undefined") {
        player.x = newPlayer.x;
        player.y = newPlayer.y;
    }
    this.players[player.id] = player;

    return player;
};

Game.prototype.removePlayer = function (id) {
    delete this.players[id];
};

Game.prototype.setTickRate = function (tr) {
    tickRate = tr;
};

Game.prototype.getTickRate = function () {
    return tickRate;
};

module.exports = Game;

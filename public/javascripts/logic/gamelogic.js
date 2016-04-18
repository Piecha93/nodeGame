var Player = require('./player');
var DeltaTimer = require('./detlatimer');

var timer = new DeltaTimer();

function Game() {
    this.players = {};
    //this.inputArray = {};
}

Game.prototype.startGameLoop = function () {
    gameLoop(this);
};

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

function gameLoop(self) {
    var delta = timer.getDelta();
    self.handleInput(delta);
    self.update(delta);

    setTimeout(function () {
        gameLoop(self);
    }, 10);
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

module.exports = Game;

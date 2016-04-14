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

    for (var key in this.players) {
        console.log('dd' + this.players[key].x);
    }
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
        this.playerInput(key, this.players[key].input, delta)
    }
};

Game.prototype.playerInput = function (playerId, input, delta) {
    var player = this.players[playerId];
    input.forEach(function (i) {
        var dir;
        switch (i) {
            case 37:
                dir = 'left';
                break;
            case 39:
                dir = 'right';
                break;
            case 38:
                dir = 'up';
                break;
            case 40:
                dir = 'down';
                break;
        }
        player.move(dir, delta);
    });
    player.input = [];
}

Game.prototype.update = function () {

};

module.exports = Game;

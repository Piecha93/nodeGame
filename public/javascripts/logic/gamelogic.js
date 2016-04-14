var Player = require('./player');
var DeltaTimer = require('./detlatimer');

var timer = new DeltaTimer();

function Game() {
    this.players = {};

    this.dd = 'asdddwwwwwwwwwwwwww';
}

Game.prototype.startGameLoop = function () {
    gameLoop(this);
};

//creates new player
Game.prototype.newPlayer = function (id, newPlayer) {
    var player = new Player();
    player.id = id;
    //this.players.push(player);

    if (typeof newPlayer !== "undefined") {
        player.x = newPlayer.x;
        player.y = newPlayer.y;
    }

    this.players[player.id] = player;

    return player;
};


Game.prototype.removePlayer = function (id) {
    //var indexToRemove = this.players.indexOf(id);
    //this.players.splice(indexToRemove, 1);
    delete this.players[id];

    for (var key in this.players) {
        console.log('dd' + this.players[key].x);
    }
};

function gameLoop(self) {
    var delta = timer.getDelta();
    handleInput();
    update();

    setTimeout(function () {
        gameLoop(self);
    }, 100);
};

function handleInput(player, input) {

};

function update() {

};

module.exports = Game;

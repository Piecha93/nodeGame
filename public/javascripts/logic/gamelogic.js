var Player = require('./player');
var DeltaTimer = require('./detlatimer');

var timer = new DeltaTimer();

function Game() {
    this.players = {};
}

Game.prototype.startGameLoop = function () {
    this.gameLoop();
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

Game.prototype.gameLoop = function () {
    var delta = timer.getDelta();
    handleInput();
    update();
    render();

    console.log('dd');
    //  for (var key in this.players) {
    //     console.log('dd' + this.players[key].x);
    //   }

    setTimeout(this.gameLoop, 1);
};

function handleInput() {

};

function update() {

};

function render() {

};

module.exports = Game;

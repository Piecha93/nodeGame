var Player = require('./player');

function Game() {
    this.players = [];
}

Game.prototype.gameLoop = function()  {
    var lastUpdate = new Date().getTime();
    while(true) {
        var currentTime = new Date().getTime();
        var delta = lastUpdate - currentTime;
        lastUpdate = currentTime;

        this.handleInput();
        this.update();
        this.render();
    }
};

Game.prototype.handleInput = function() {

};

Game.prototype.update = function() {

};

Game.prototype.render = function() {

};

Game.prototype.newPlayer = function(id) {
    var player = new Player();
    player.id = id;
    this.players.push(player);
};

Game.prototype.removePlayer = function (id) {
    var indexToRemove = this.players.indexOf(id);
    this.players.splice(indexToRemove, 1);
};

module.exports = Game;

module.exports.players = this.players;

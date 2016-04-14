function Player() {
    this.x = Math.random() * 300;
    this.y = Math.random() * 300;
    ;
    this.id = 0;
}

Player.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
};

Player.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
};

Player.prototype.update = function (player) {
    this.x = player.x;
    this.y = player.y;
};

module.exports = Player;
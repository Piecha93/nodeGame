function Player() {
    this.x = 0;
    this.y = 0;
    
    this.id = 0;
}

Player.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
}

module.exports = Player;
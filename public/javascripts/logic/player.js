function Player() {
    this.x = Math.random() * 300;
    this.y = Math.random() * 300;
    this.input = [];

    this.speed = 1;
    this.id = 0;
}

/*
Player.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
 };*/

Player.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
};

Player.prototype.update = function (player) {
    this.x = player.x;
    this.y = player.y;
};

Player.prototype.move = function (dir, delta) {
    var offset = this.speed * delta;
    switch (dir) {
        case 'left':
            this.x -= offset;
            break;
        case 'right':
            this.x += offset;
            break;
        case 'up':
            this.y -= offset;
            break;
        case 'down':
            this.y += offset;
            break;
    }
    console.log('ide o ' + offset);
};

module.exports = Player;
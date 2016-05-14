/*
 player class
 */

var HorizontalDir = {none: 0, left: -1, right: 1};
var VerticalDir = {none: 0, up: -1, down: 1};

function Player() {
    this.body = null;
    this.input = [];
    this.horizontalDir = HorizontalDir.none;
    this.verticalDir = VerticalDir.none;
    this.speed = 0.15;
    this.isChanged = true;
    this.name = "";

    this.isMainPlayer = false;

    this.horizontalMove = HorizontalDir.none;
    this.verticalMove = VerticalDir.none;
}

Player.prototype.handleInput = function () {
    if (this.horizontalDir != 0 || this.verticalDir != 0) {
        this.horizontalDir = HorizontalDir.none;
        this.verticalDir = VerticalDir.none;
        this.isChanged = true;
    }

    var self = this;
    this.input.forEach(function (i) {
        switch (i) {
            case 37:
            case 65:
                self.horizontalDir = HorizontalDir.left;
                break;
            case 39:
            case 68:
                self.horizontalDir = HorizontalDir.right;
                break;
            case 38:
            case 87:
                self.verticalDir = VerticalDir.up;
                break;
            case 40:
            case 83:
                self.verticalDir = VerticalDir.down;
                break;
        }
    });
};

//update player position depends on delta and move direction
Player.prototype.update = function (delta) {
    var offset = this.speed * delta;
    if (this.verticalDir != 0 && this.horizontalDir != 0)
        offset = offset * Math.sin(45 * (180 / Math.PI));

    this.body.position[0] += this.horizontalDir * offset;
    this.body.position[1] += this.verticalDir * offset;

    if (this.verticalDir != 0 || this.horizontalDir != 0) {
        this.isChanged = true;
    }
};

//set player position to x, y
Player.prototype.setPosition = function (x, y) {
    this.body.position[0] = x;
    this.body.position[1] = y;
};

Player.prototype.serverUpdate = function (playerUpdateInfo) {
    //console.log('local: ' + this.x + ' server: ' + playerUpdateInfo.x);
    this.setPosition(playerUpdateInfo.position[0], playerUpdateInfo.position[1]);
    this.horizontalMove = playerUpdateInfo.horizontalMove;
    this.verticalMove = playerUpdateInfo.verticalMove;
    this.name = playerUpdateInfo.name;
    this.body.angle = playerUpdateInfo.angle;
};

Player.prototype.getUpdateInfo = function () {
    var playerUpdateInfo = {};
    playerUpdateInfo.position = this.body.position;
    playerUpdateInfo.horizontalMove = this.horizontalDir;
    playerUpdateInfo.verticalMove = this.verticalDir;
    playerUpdateInfo.name = this.name;
    playerUpdateInfo.angle = this.body.angle;

    return playerUpdateInfo;
};

module.exports = Player;
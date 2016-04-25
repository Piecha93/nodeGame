var InputHandler = require('./inputhandler');

var HorizontalDir = {none: 0, left: -1, right: 1};
var VerticalDir = {none: 0, up: -1, down: 1};

function Player() {
    this.x = Math.random() * 800;
    this.y = Math.random() * 600;
    this.input = [];
    this.horizontalDir = HorizontalDir.none;
    this.verticalDir = VerticalDir.none;
    this.speed = 0.15;
    this.inputHandler = false;
    this.isChanged = true;
    this.id = -1;

    this.horizontalMove = HorizontalDir.none;
    this.verticalMove = VerticalDir.none;
}

//create new input handler
Player.prototype.setUpInputHandler = function () {
    this.inputHandler = new InputHandler();
};


Player.prototype.handleInput = function () {
    //inputHandler exist only on client local player (never on server)
    if (this.inputHandler) {
        this.input = this.inputHandler.handleClientInput();
    }

    if (this.horizontalDir != 0 || this.verticalDir != 0) {
        this.horizontalDir = HorizontalDir.none;
        this.verticalDir = VerticalDir.none;
        this.isChanged = true;
    }

    var self = this;
    this.input.forEach(function (i) {
        self.isChanged = true;
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

//update player position depends on delta and movedir
Player.prototype.update = function (delta) {
    var offset = this.speed * delta;
    if (this.verticalDir != 0 && this.horizontalDir != 0)
        offset = offset * Math.sin(45 * (180 / Math.PI));
    this.x += this.horizontalDir * offset;
    this.y += this.verticalDir * offset;
};

//set player position to x, y
Player.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
};

Player.prototype.serverUpdate = function (playerUpdateInfo) {
    this.setPosition(playerUpdateInfo.x, playerUpdateInfo.y);
    this.horizontalMove = playerUpdateInfo.horizontalMove;
    this.verticalMove = playerUpdateInfo.verticalMove;
};

Player.prototype.getUpdateInfo = function () {
    var playerUpdateInfo = {};
    playerUpdateInfo.x = this.x;
    playerUpdateInfo.y = this.y;
    playerUpdateInfo.horizontalMove = this.horizontalDir;
    playerUpdateInfo.verticalMove = this.verticalDir;

    return playerUpdateInfo;
};

module.exports = Player;
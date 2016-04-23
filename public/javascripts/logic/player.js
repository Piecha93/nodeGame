var InputHandler = require('./inputhandler');

var HorizontalDir = {none: 0, left: -1, right: 1};
var VerticalDir = {none: 0, up: -1, down: 1};

function Player() {
    this.x = Math.random() * 300;
    this.y = Math.random() * 300;
    this.input = [];
    this.horizontalDir = HorizontalDir.none;
    this.verticalDir = VerticalDir.none;
    this.speed = 0.3;
    this.inputHandler = false;
    this.isChanged = true;
    this.id = -1;
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

    this.horizontalDir = HorizontalDir.none;
    this.verticalDir = VerticalDir.none;

    var self = this;
    this.input.forEach(function (i) {
        self.isChanged = true;
        switch (i) {
            case 37:
                self.horizontalDir = HorizontalDir.left;
                break;
            case 39:
                self.horizontalDir = HorizontalDir.right;
                break;
            case 38:
                self.verticalDir = VerticalDir.up;
                break;
            case 40:
                self.verticalDir = VerticalDir.down;
                break;
        }
    });
};

//set player position to x, y
Player.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
};

//update player position depends on delta and movedir
Player.prototype.update = function (delta) {
    var offset = this.speed * delta;
    this.x += this.horizontalDir * offset;
    this.y += this.verticalDir * offset;
};

Player.prototype.serverUpdate = function (player) {
    this.x = player.x;
    this.y = player.y;
};

module.exports = Player;
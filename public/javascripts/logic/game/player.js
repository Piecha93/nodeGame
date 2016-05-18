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
    this.speed = 0.2;
    this.isChanged = true;
    this.name = "";

    this.isMainPlayer = false;

    this.horizontalMove = HorizontalDir.none;
    this.verticalMove = VerticalDir.none;

    this.lastUpdateInfo = {
        position: [0, 0],
        horizontalMove: 2,
        verticalMove: 2,
        name: "",
        angle: 999
    };

    /*  this.hdir = HorizontalDir.left;
     console.log('start hdir: ' + this.hdir);
     this.hdircpy = this.hdir;
     this.hdircpy = HorizontalDir.right;
     console.log('cpy: ' + this.hdircpy);
     console.log('org: ' + this.hdir);*/

}

Player.prototype.handleInput = function () {
    if (this.horizontalDir != 0 || this.verticalDir != 0) {
        this.horizontalDir = HorizontalDir.none;
        this.verticalDir = VerticalDir.none;
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
    if (this.body != null) {
        var offset = this.speed * delta;
        if (this.verticalDir != 0 && this.horizontalDir != 0)
            offset = offset * Math.sin(45 * (180 / Math.PI));

        this.body.position[0] += this.horizontalDir * offset;
        this.body.position[1] += this.verticalDir * offset;

        // if (this.verticalDir != 0 || this.horizontalDir != 0
        //     || this.body.velocity[0] != 0 || this.body.velocity[1] != 0) {
        //      this.isChanged = true;
        // }
    }
};

//set player position to x, y
Player.prototype.setPosition = function (x, y) {
    if (this.body != null) {
        this.body.position[0] = x;
        this.body.position[1] = y;
    }
};

Player.prototype.serverUpdate = function (playerUpdateInfo) {
    if (playerUpdateInfo.hasOwnProperty('position')) {
        this.setPosition(playerUpdateInfo.position[0], playerUpdateInfo.position[1]);
    }
    if (playerUpdateInfo.hasOwnProperty('horizontalMove')) {
        this.horizontalMove = playerUpdateInfo.horizontalMove;
    }
    if (playerUpdateInfo.hasOwnProperty('verticalMove')) {
        this.verticalMove = playerUpdateInfo.verticalMove;
    }
    if (playerUpdateInfo.hasOwnProperty('name')) {
        this.name = playerUpdateInfo.name;
    }
    if (playerUpdateInfo.hasOwnProperty('angle')) {
        this.body.angle = playerUpdateInfo.angle;
    }
};

//get all update info
Player.prototype.getAllUpdateInfo = function () {
    var playerUpdateInfo = {};
    playerUpdateInfo.position = this.body.position;
    playerUpdateInfo.horizontalMove = this.horizontalDir;
    playerUpdateInfo.verticalMove = this.verticalDir;
    playerUpdateInfo.name = this.name;
    playerUpdateInfo.angle = this.body.angle;

    return playerUpdateInfo;
};

//get only update info from things which has changed
Player.prototype.getUpdateInfo = function () {
    var playerUpdateInfo = {};
    if (this.lastUpdateInfo.position[0] != this.body.position[0] || this.lastUpdateInfo.position[1] != this.body.position[1]) {
        playerUpdateInfo.position = this.body.position;
        this.lastUpdateInfo.position = [this.body.position[0], this.body.position[1]];
    }
    if (this.lastUpdateInfo.horizontalMove != this.horizontalDir) {
        playerUpdateInfo.horizontalMove = this.horizontalDir;
        this.lastUpdateInfo.horizontalMove = this.horizontalDir;
    }
    if (this.lastUpdateInfo.verticalMove != this.verticalDir) {
        playerUpdateInfo.verticalMove = this.verticalDir;
        this.lastUpdateInfo.verticalMove = this.verticalDir;
    }
    if (this.lastUpdateInfo.angle != this.body.angle) {
        playerUpdateInfo.angle = this.body.angle;
        this.lastUpdateInfo.angle = this.body.angle;
    }
    if (this.lastUpdateInfo.name != this.name) {
        playerUpdateInfo.name = this.name;
        this.lastUpdateInfo.name = this.name;
    }

    return playerUpdateInfo;
};


module.exports = Player;
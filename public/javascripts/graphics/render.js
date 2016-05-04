var PlayerRender = require("./playerrender");
var MessageInputRender = require("./messageinputrender");
var MessageBoxRender = require("./messageboxrender");
var StatsRender = require("./statsrender");

function Render(callback) {
    this.onLoadCallback = callback;
    this.text = null;
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
        {preload: this.preload.bind(this), create: this.create.bind(this)});

    this.objects = {};
    this.messageBoxRender = null;
    this.messageInputRender = null;
    this.statsRender = null;
}

//load images
Render.prototype.preload = function () {
    //load assets
    this.game.load.atlasJSONHash('panda', 'resources/images/panda.png', 'resources/images/panda.json');
    //set callback
    this.game.load.onLoadComplete.add(this.onLoadCallback);
};

Render.prototype.create = function () {
};

Render.prototype.createMessageBox = function (messageBox) {
    //create MessengerBox
    this.messageBoxRender = new MessageBoxRender(this.game, messageBox);

    this.messageBoxRender.init();

    //create messageInputRender
    this.messageInputRender = new MessageInputRender(this.game);
    this.messageInputRender.init();
};

Render.prototype.destroyMessageBox = function () {
    this.messageBoxRender.destroy();
    this.messageInputRender.destroy();

    this.messageInputRender = null;
    this.messageBoxRender = null;
}

Render.prototype.enterChat = function () {
    if (this.messageInputRender != null) {
        this.messageInputRender.startTyping();
    }
};

Render.prototype.endChat = function () {
    if (this.messageInputRender != null) {
        return this.messageInputRender.getTextAndReset();
    }
};

Render.prototype.createStatsRender = function (ping) {
    this.statsRender = new StatsRender(this.game, ping);
    this.statsRender.init();
};

Render.prototype.destroyStatsRender = function () {
    this.statsRender.destroy();
    this.statsRender = null;
};

Render.prototype.newPlayer = function (player) {
    //create new player render
    var playerRender = new PlayerRender(this.game, player);

    playerRender.init();

    //add playerrender to objects array
    this.objects[player.id] = playerRender;
};

Render.prototype.removePlayer = function (id) {
    if (id in this.objects) {
        //remove form game
        this.objects[id].destroy();
        //remove from objects array
        delete this.objects[id];

        console.log('player removed from render');
    }
};

Render.prototype.update = function (delta) {
    for (var key in this.objects) {
        this.objects[key].update();
    }
    if (this.messageBoxRender != null) {
        this.messageBoxRender.update();
    }
    if (this.statsRender != null) {
        this.statsRender.update();
    }
};

module.exports = Render;
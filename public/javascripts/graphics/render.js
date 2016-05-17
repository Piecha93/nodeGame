var PlayerRender = require("./playerrender");
var MessageInputRender = require("./messageinputrender");
var MessageBoxRender = require("./messageboxrender");
var StatsRender = require("./statsrender");
var MapRender = require("./maprender");

function Render(onLoadCallback, mouseMoveCallback) {
    this.onLoadCallback = onLoadCallback;
    this.mouseMoveCallback = mouseMoveCallback;
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
        {preload: this.preload.bind(this), create: this.create.bind(this)});

    this.objects = {};
    this.localPlayerRender = null;
    this.messageBoxRender = null;
    this.messageInputRender = null;
    this.statsRender = null;
    this.mapRender = null;
}

//load images
Render.prototype.preload = function () {
    //load assets
    this.game.load.atlasJSONHash('panda', 'resources/images/panda.png', 'resources/images/panda.json');
    this.game.load.bitmapFont('gem', 'resources/fonts/gem.png', 'resources/fonts/gem.xml');
    this.game.load.image('player', 'resources/images/player.png');
    this.game.load.image('tiles', 'resources/images/terrain.png');
    this.game.load.tilemap('testmap', 'resources/maps/mapatest.json', null, Phaser.Tilemap.TILED_JSON);
    //set callback (client connect to server when all assets are loaded)
    this.game.load.onLoadComplete.add(this.onLoadCallback);
};

Render.prototype.create = function () {
    this.game.stage.backgroundColor = "#4488AA";

    this.game.input.addMoveCallback(mouseMoveCallback, this);
    this.game.renderer.renderSession.roundPixels = true;
};

Render.prototype.createMap = function (name) {
    this.mapRender = new MapRender(this.game, name);
    this.mapRender.init();
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
};

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

    if (player.isMainPlayer) {
        this.localPlayerRender = playerRender;
    }

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

function mouseMoveCallback(mousePointer) {
    var radians = Math.atan2(mousePointer.x - this.localPlayerRender.sprite.x + this.game.camera.x
        , mousePointer.y - this.localPlayerRender.sprite.y + this.game.camera.y);
    var degree = (radians * (180 / Math.PI) * -1) + 90;
    this.mouseMoveCallback(degree);
}

module.exports = Render;
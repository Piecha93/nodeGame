var PlayerRender = require("./playerrender");
var MessageInputRender = require("./messageinputrender");
var MessageBoxRender = require("./messageboxrender");
var StatsRender = require("./statsrender");
var MapRender = require("./maprender");

function Render(onLoadCallback, mouseMoveCallback) {
    this.onLoadCallback = onLoadCallback;
    this.mouseMoveCallback = mouseMoveCallback;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example',
        {preload: this.preload.bind(this), create: this.create.bind(this)});

    this.characters = {};
    this.localPlayerRender = null;
    this.messageBoxRender = null;
    this.messageInputRender = null;
    this.statsRender = null;
    this.mapRender = null;

    //groups
    this.mapGroup = null;
    this.charactersGroup = null;
    this.textGroup = null;
}

//load images
Render.prototype.preload = function () {
    //load assets
    //this.game.load.atlasJSONHash('panda', 'resources/images/panda.png', 'resources/images/panda.json');
    //this.game.load.bitmapFont('gem', 'resources/fonts/gem.png', 'resources/fonts/gem.xml');
    this.game.load.image('player', 'resources/images/player.png');
    this.game.load.image('tiles', 'resources/images/terrain.png');
    //this.game.load.tilemap('testmap', 'resources/maps/mapatest.json', null, Phaser.Tilemap.TILED_JSON);
    //set callback (client connect to server when all assets are loaded)
    this.game.load.onLoadComplete.addOnce(this.onLoadCallback);
};

Render.prototype.create = function () {
    this.mapGroup = this.game.add.group();
    this.charactersGroup = this.game.add.group();
    this.textGroup = this.game.add.group();
    
    this.game.stage.backgroundColor = "#4488AA";

    this.game.input.addMoveCallback(mouseMoveCallback, this);
    this.game.renderer.renderSession.roundPixels = true
};

Render.prototype.update = function (delta) {
    for (var key in this.characters) {
        this.characters[key].update();
    }
    if (this.messageBoxRender != null) {
        this.messageBoxRender.update();
    }
    if (this.statsRender != null) {
        this.statsRender.update();
    }
};

Render.prototype.createMap = function (name) {
    this.mapRender = new MapRender(this.game, this.mapGroup, name);
    this.mapRender.init();
};

Render.prototype.createMessageBox = function (messageBox) {
    //create MessengerBox
    this.messageBoxRender = new MessageBoxRender(this.game, this.textGroup, messageBox);

    this.messageBoxRender.init();

    //create messageInputRender
    this.messageInputRender = new MessageInputRender(this.game, this.textGroup);
    this.messageInputRender.init();
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
    this.statsRender = new StatsRender(this.game, this.textGroup, ping);
    this.statsRender.init();
};

Render.prototype.newCharacter = function (player) {
    //create new player render
    var playerRender = new PlayerRender(this.game, this.charactersGroup, player);

    if (player.isMainPlayer) {
        this.localPlayerRender = playerRender;
    }

    playerRender.init();
    //add playerrender to characters array
    this.characters[player.name] = playerRender;
};

Render.prototype.removeCharacter = function (name) {
    if (name in this.characters) {
        //remove form game
        this.characters[name].destroy();
        //remove from characters array
        delete this.characters[name];

        console.log('player removed from render');
    }
};

Render.prototype.destroyCharacters = function () {
    for (var key in this.characters) {
        this.characters[key].destroy();
    }
    this.localPlayerRender = null;
    this.characters = {};
};

Render.prototype.destroyMap = function () {
    if (this.mapRender != null) {
        this.mapRender.destroy();
        this.mapRender = null;
    }
};

Render.prototype.destroyMessageBox = function () {
    if (this.messageBoxRender != null) {
        this.messageBoxRender.destroy();
        this.messageBoxRender = null;
    }
    if (this.messageInputRender != null) {
        this.messageInputRender.destroy();
        this.messageInputRender = null;
    }
};

Render.prototype.destroyStatsRender = function () {
    if (this.statsRender != null) {
        this.statsRender.destroy();
        this.statsRender = null;
    }
};

Render.prototype.destroyAll = function () {
    this.destroyMap();
    this.destroyMessageBox();
    this.destroyStatsRender();
    this.destroyCharacters();
};

function mouseMoveCallback(mousePointer) {
    if (this.localPlayerRender != null) {
        var radians = Math.atan2(mousePointer.x - this.localPlayerRender.sprite.x + this.game.camera.x
            , mousePointer.y - this.localPlayerRender.sprite.y + this.game.camera.y);
        var degree = (radians * (180 / Math.PI) * -1) + 180;
        this.mouseMoveCallback(degree);
    }
}

module.exports = Render;
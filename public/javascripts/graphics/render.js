var PlayerRender = require("./playerrender");
var MessageRender = require("./messengerrender");

function Render(callback) {
    this.onLoadCallback = callback;
    this.text = null;
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
        {preload: this.preload.bind(this), create: this.create.bind(this)});

    this.objects = {};
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

Render.prototype.enterChat = function () {
    this.messageRender = new MessageRender();
    var bitmap = this.game.add.bitmapData(400, 100);
    this.messageRender.init(this.game.add.sprite(0, this.game.height - 40, bitmap), bitmap.canvas);
};

Render.prototype.endChat = function () {
    return this.messageRender.getTextAndDestroy();
};


Render.prototype.update = function (delta) {
    for (var key in this.objects) {
        this.objects[key].update();
    }
};

Render.prototype.newPlayer = function (player) {
    //create new player render
    var playerRender = new PlayerRender();

    //set up player reference
    playerRender.player = player;

    playerRender.init(this.game.add.sprite(0, 0, 'panda'));
    playerRender.update();

    this.objects[player.id] = playerRender;
};

Render.prototype.removePlayer = function (id) {
    if (id in this.objects) {
        //remove form game
        this.objects[id].sprite.destroy();
        //remove from objects array
        delete this.objects[id];

        console.log('player removed from render');
    }
};

module.exports = Render;
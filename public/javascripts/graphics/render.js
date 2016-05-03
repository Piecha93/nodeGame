var PlayerRender = require("./playerrender");

function Render(callback) {
    this.onLoadCallback = callback;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example',
        {preload: this.preload.bind(this), create: this.create, render: this.update});

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
    this.game.add.plugin(Fabrique.Plugins.InputField);


};

Render.prototype.update = function (delta) {
    for (var key in this.objects) {
        this.objects[key].update();
    }

    //this.renderer.render(this.stage);
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
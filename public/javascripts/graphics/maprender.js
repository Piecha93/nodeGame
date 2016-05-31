/*
 render text area for chat input
 using CanvasInput library
 */
function MapRender(game, group, name) {
    this.game = game;
    this.group = group;
    this.map = null;
    this.name = name;
    this.layers = [];
}

MapRender.prototype.init = function () {
    if (this.game.cache.checkTilemapKey(this.name) == false) {
        this.game.load.tilemap(this.name, 'resources/maps/' + this.name + '.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.start();
        this.game.load.onLoadComplete.addOnce(loadComplete, this);
    } else {
        loadComplete.bind(this)();
    }
};

function loadComplete() {
    this.map = this.game.add.tilemap(this.name);
    this.map.addTilesetImage('terrain', 'tiles');

    this.layers[0] = this.map.createLayer('layer1', undefined, undefined, this.group);
    this.layers[1] = this.map.createLayer('layer2', undefined, undefined, this.group);
    this.layers[2] = this.map.createLayer('layer3', undefined, undefined, this.group);
    this.layers[3] = this.map.createLayer('layer4', undefined, undefined, this.group);

    this.layers[0].resizeWorld();
}

MapRender.prototype.update = function () {

};

MapRender.prototype.destroy = function () {
    for (var i = 0; i < 4; i++) {
        if (this.layers[i] != null) {
            this.layers[i].destroy();
        }
    }
    this.layers = [];

    if (this.map != null) {
        this.map.destroy();
        this.map = null;
    }

    this.game.cache.removeTilemap(this.name);
    this.game = null;
    this.group = null;
};

module.exports = MapRender;
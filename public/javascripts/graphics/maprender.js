/*
 render text area for chat input
 using CanvasInput library
 */
function MessageInputRender(game, name) {
    this.game = game;
    this.map = null;
    this.name = name;
}

MessageInputRender.prototype.init = function () {
    this.map = this.game.add.tilemap(this.name);
    this.map.addTilesetImage('terrain', 'tiles');

    var layer1 = this.map.createLayer('layer1');
    var layer2 = this.map.createLayer('layer2');
    var layer3 = this.map.createLayer('layer3');
    var layer4 = this.map.createLayer('layer4');

    layer1.resizeWorld();
};

MessageInputRender.prototype.update = function () {

};

MessageInputRender.prototype.destroy = function () {

};

module.exports = MessageInputRender;
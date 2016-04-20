function PlayerRender() {
    this.shape;
    this.player;
}

PlayerRender.prototype.init = function () {
    this.shape.graphics.beginFill("Pink").drawCircle(0, 0, 25);
}

PlayerRender.prototype.update = function () {
    this.shape.x = this.player.x;
    this.shape.y = this.player.y;
};

module.exports = PlayerRender;
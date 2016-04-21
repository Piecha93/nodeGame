function PlayerRender() {
    this.shape;
    this.text;
    this.player;
}

PlayerRender.prototype.init = function () {
    this.shape.graphics.beginFill("Pink").drawCircle(0, 0, 25);

    this.text.textAlign = "center";
    this.text.text = this.player.id;
};

PlayerRender.prototype.update = function () {
    // this.shape.x = this.player.x;
    // this.shape.y = this.player.y;
    createjs.Tween.get(this.shape).to({x: this.player.x, y: this.player.y}, 15);
    createjs.Tween.get(this.text).to({x: this.player.x, y: this.player.y}, 15);
};

module.exports = PlayerRender;
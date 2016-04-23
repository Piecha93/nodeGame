function PlayerRender() {
    this.shape = null;
    this.text = null;
    this.player = null;
}

PlayerRender.prototype.init = function () {
    //this.shape.graphics.beginFill("Pink").drawCircle(0, 0, 25);
    // this.shapeTween = createjs.Tween.get(this.shape);

    //this.text.textAlign = "center";
    //this.text.text = this.player.id;
    //  this.textTween = createjs.Tween.get(this.text);

};

PlayerRender.prototype.update = function () {
    this.shape.x = this.player.x;
    this.shape.y = this.player.y;
    //createjs.Tween.get(this.shape).to({x: this.player.x, y: this.player.y}, 0);
    //createjs.Tween.get(this.text).to({x: this.player.x, y: this.player.y}, 0);
};

module.exports = PlayerRender;
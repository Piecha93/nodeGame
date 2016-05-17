/*
 player render
 */

function PlayerRender(game, player) {
    this.game = game;
    this.player = player;
    this.sprite = null;
    this.nameText = null;
    //1 - no lerp, >1 - lerp, do not set this to <1
    this.lerpRate = 10;

}

PlayerRender.prototype.init = function () {
    this.sprite = this.game.add.sprite(0, 0, 'player');
    this.sprite.width /= 2;
    this.sprite.height /= 2;

    this.sprite.anchor.set(0.5);

    this.nameText = this.game.add.text(this.player.x, this.player.y, this.player.name, {
        font: "bold 11px Arial",
        fill: "#ffffff"
    });

    this.nameText.text = this.player.name;
    this.nameText.anchor.set(0.5);

    if (this.player.isMainPlayer) {
        this.game.camera.follow(this.sprite);
    }

    //this.circle = this.game.add.graphics(0, 0);
    //this.circle.beginFill(0xFF0000, 555);
    //this.circle.drawCircle(this.player.x, this.player.y, 1);
};

PlayerRender.prototype.update = function () {

    //sprite position update
    this.sprite.x += (this.player.body.position[0] - this.sprite.x) / this.lerpRate;
    this.sprite.y += (this.player.body.position[1] - this.sprite.y) / this.lerpRate;
    this.sprite.angle = this.player.body.angle;

    //name position update
    this.nameText.x = this.sprite.x;
    this.nameText.y = this.sprite.y - 20;
};

PlayerRender.prototype.destroy = function () {
    this.sprite.destroy();
    this.nameText.destroy();
};

module.exports = PlayerRender;
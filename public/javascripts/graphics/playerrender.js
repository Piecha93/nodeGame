/*
 player render
 */

function PlayerRender(game, group, player) {
    this.game = game;
    this.group = group;
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

    this.group.add(this.sprite);
    this.group.add(this.nameText);

    if (this.player.isMainPlayer) {
        this.game.camera.follow(this.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
    }
};

PlayerRender.prototype.update = function () {
    //sprite position update
    this.sprite.x += (this.player.body.position[0] - this.sprite.x) / this.lerpRate;
    this.sprite.y += (this.player.body.position[1] - this.sprite.y) / this.lerpRate;

    this.sprite.y = this.player.body.position[1];
    this.sprite.angle = this.player.body.angle;

    //name position update
    this.nameText.text = this.player.name;
    this.nameText.x = this.sprite.x;
    this.nameText.y = this.sprite.y - 20;

    //this.game.world.bringToTop(this.sprite);
    //this.game.world.bringToTop(this.nameText);
};

PlayerRender.prototype.destroy = function () {
    this.sprite.destroy();
    this.sprite = null;
    this.nameText.destroy();
    this.nameText = null;
    this.player = null;
    this.game = null;
    this.group = null;
};

module.exports = PlayerRender;
function PlayerRender() {
    this.player = null;
    this.sprite = null;
    this.text = null;
    //1 - no lerp, >1 - lerp, do not set this to <1
    this.lerpRate = 10;
}

PlayerRender.prototype.init = function (sprite) {
    this.animationSpeed = this.player.speed * 30;
    this.sprite = sprite;
    this.sprite.animations.add('left', ['left1.png', 'left2.png', 'left3.png', 'left4.png'], this.animationSpeed, true);
    this.sprite.animations.add('right', ['right1.png', 'right2.png', 'right3.png', 'right4.png'], this.animationSpeed, true);
    this.sprite.animations.add('up', ['up1.png', 'up2.png', 'up3.png', 'up4.png'], this.animationSpeed, true);
    this.sprite.animations.add('down', ['down1.png', 'down2.png', 'down3.png', 'down4.png'], this.animationSpeed, true);
};

PlayerRender.prototype.update = function () {
    //animation update
    if (this.player.horizontalDir == -1 || this.player.horizontalMove == -1) {
        this.sprite.animations.play('left');
    } else if (this.player.horizontalDir == 1 || this.player.horizontalMove == 1) {
        this.sprite.animations.play('right');
    } else if (this.player.verticalDir == -1 || this.player.verticalMove == -1) {
        this.sprite.animations.play('up');
    } else if (this.player.verticalDir == 1 || this.player.verticalMove == 1) {
        this.sprite.animations.play('down');
    } else {
        this.sprite.animations.stop();
    }

    //position update
    this.sprite.x += (this.player.x - this.sprite.x) / this.lerpRate;
    this.sprite.y += (this.player.y - this.sprite.y) / this.lerpRate;
};

module.exports = PlayerRender;
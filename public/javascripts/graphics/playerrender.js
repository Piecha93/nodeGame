function PlayerRender() {
    this.currentAnimation = null;
    this.text = null;
    this.player = null;

    this.framesLeft = [];
    this.framesRight = [];
    this.framesUp = [];
    this.framesDown = [];

    //1 - no lerp, >1 - lerp, do not set this to <1
    this.lerpRate = 10;
}

PlayerRender.prototype.init = function (spriteName) {
    for (var i = 1; i < 5; i++) {
        this.framesLeft.push(PIXI.Texture.fromFrame(spriteName + 'left' + i + '.png'));
        this.framesRight.push(PIXI.Texture.fromFrame(spriteName + 'right' + i + '.png'));
        this.framesUp.push(PIXI.Texture.fromFrame(spriteName + 'up' + i + '.png'));
        this.framesDown.push(PIXI.Texture.fromFrame(spriteName + 'down' + i + '.png'));
    }

    this.currentAnimation = new PIXI.extras.MovieClip(this.framesDown);
    this.currentAnimation.animationSpeed = this.player.speed / 2;

    this.text = new PIXI.Text(this.player.id, {fill: 0xff1010, align: 'center', font: '22px Arial'});
    this.text.x -= this.text.texture.width / 2;
    this.text.y -= 30;
    this.currentAnimation.addChild(this.text);
};

PlayerRender.prototype.update = function () {
    //animation update
    if (this.player.horizontalDir == -1 || this.player.horizontalMove == -1) {
        this.currentAnimation.textures = this.framesLeft;
        this.currentAnimation.play();
    } else if (this.player.horizontalDir == 1 || this.player.horizontalMove == 1) {
        this.currentAnimation.textures = this.framesRight;
        this.currentAnimation.play();
    } else if (this.player.verticalDir == -1 || this.player.verticalMove == -1) {
        this.currentAnimation.textures = this.framesUp;
        this.currentAnimation.play();
    } else if (this.player.verticalDir == 1 || this.player.verticalMove == 1) {
        this.currentAnimation.textures = this.framesDown;
        this.currentAnimation.play();
    } else {
        this.currentAnimation.stop();
    }

    //position update
    this.currentAnimation.x += (this.player.x - this.currentAnimation.x) / this.lerpRate;
    this.currentAnimation.y += (this.player.y - this.currentAnimation.y) / this.lerpRate;
};

module.exports = PlayerRender;
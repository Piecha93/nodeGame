function PlayerRender() {
    this.currentAnimation = null;
    this.text = null;
    this.player = null;

    this.framesLeft = [];
    this.framesRight = [];
    this.framesUp = [];
    this.framesDown = [];

    this.dir = "left";

}

PlayerRender.prototype.init = function () {
    this.currentAnimation.animationSpeed = 0.1;
};

PlayerRender.prototype.update = function () {
    if (this.player.horizontalMove == -1) {
        this.currentAnimation.textures = this.framesLeft;
        this.currentAnimation.play();
    } else if (this.player.horizontalMove == 1) {
        this.currentAnimation.textures = this.framesRight;
        this.currentAnimation.play();
    } else if (this.player.verticalMove == -1) {
        this.currentAnimation.textures = this.framesUp;
        this.currentAnimation.play();
    } else if (this.player.verticalMove == 1) {
        this.currentAnimation.textures = this.framesDown;
        this.currentAnimation.play();
    } else {
        this.currentAnimation.stop();
    }

    this.currentAnimation.x = this.player.x;
    this.currentAnimation.y = this.player.y;
    //createjs.Tween.get(this.shape).to({x: this.player.x, y: this.player.y}, 0);
    //createjs.Tween.get(this.text).to({x: this.player.x, y: this.player.y}, 0);
};

module.exports = PlayerRender;
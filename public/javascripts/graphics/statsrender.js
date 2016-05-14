/*
 render textarea for chat
 using CanvasInput library
 */
function StarsRender(game, ping) {
    this.game = game;
    this.pingText = null;
    this.ping = ping;
    this.oldPingValue = -1;
}

StarsRender.prototype.init = function () {
    this.pingText = this.game.add.text(this.game.width - 100, 0, "", {
        font: "bold 16px Arial",
        fill: "#ffffff"
    });

    this.pingText.fixedToCamera = true;
};

StarsRender.prototype.update = function () {
    //if value of ping reference has changed we need to update text
    if (this.oldPingValue != this.ping.value) {
        this.oldPingValue = this.ping.value;
        this.pingText.text = "Ping: " + this.ping.value.toString(10) + "ms";
    }
};

StarsRender.prototype.destroy = function () {
    this.pingText.destroy();
};

module.exports = StarsRender;
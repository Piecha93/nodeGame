/*
 render textarea for chat
 using CanvasInput library
 */
function StarsRender(game, ping) {
    this.pingText = null;
    this.ping = ping
    this.game = game;
}

StarsRender.prototype.init = function (pingText) {
    this.pingText = this.game.add.text(this.game.width - 100, 0, "", {
        font: "bold 16px Arial",
        fill: "#ffffff"
    });
};

StarsRender.prototype.update = function () {
    this.pingText.text = "Ping: " + this.ping.value.toString(10) + "ms";
};

StarsRender.prototype.destroy = function () {
    this.pingText.destroy();
};

module.exports = StarsRender;
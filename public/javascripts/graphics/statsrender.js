/*
 render textarea for chat
 using CanvasInput library
 */
function StatsRender(game, group, ping) {
    this.game = game;
    this.group = group;
    this.pingText = null;
    this.ping = ping;
    this.oldPingValue = -1;
}

StatsRender.prototype.init = function () {
    this.pingText = this.game.add.text(this.game.width - 100, 0, "", {
        font: "bold 16px Arial",
        fill: "#ffffff"
    });

    this.group.add(this.pingText);
    this.pingText.fixedToCamera = true;
};

StatsRender.prototype.update = function () {
    //if value of ping reference has changed we need to update text
    if (this.oldPingValue != this.ping.value) {
        this.oldPingValue = this.ping.value;
        this.pingText.text = "Ping: " + this.ping.value.toString(10) + "ms";
    }
    //this.game.world.bringToTop(this.pingText);
};

StatsRender.prototype.destroy = function () {
    this.pingText.destroy();
    this.pingText = null;
    this.ping = null;
    this.game = null;
    this.group = null;
};

module.exports = StatsRender;
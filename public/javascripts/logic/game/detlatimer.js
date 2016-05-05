/*
 class for counting delta
 */

function DeltaTimer() {
    this.currentTime;
    this.delta;
    this.lastUpdate = new Date().getTime();
}

DeltaTimer.prototype.getDelta = function () {
    this.currentTime = new Date().getTime();
    this.delta = this.currentTime - this.lastUpdate;
    this.lastUpdate = this.currentTime;

    return this.delta;
};

module.exports = DeltaTimer;
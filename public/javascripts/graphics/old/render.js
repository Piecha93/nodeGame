var PlayerRender = require("./playerrender");

function Render() {
    this.stage;
    this.playersRender = {};
};

Render.prototype.init = function (canvas) {
    this.stage = new createjs.Stage(canvas);
    //  this.stage.width = $(window).width();
    //  this.stage.height = $(window).height();
    //  this.stage.serverUpdateLoop();

    console.log('draw init completed');
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.stage);
};

Render.prototype.newPlayer = function (player) {
    //create new player render
    var playerRender = new PlayerRender();

    //set up player reference
    playerRender.player = player;

    //create shape for player
    playerRender.shape = new createjs.Shape();
    playerRender.text = new createjs.Text();

    playerRender.init();
    playerRender.update();

    this.playersRender[player.id] = playerRender;
    this.stage.addChild(playerRender.shape);
    this.stage.addChild(playerRender.text);

    console.log('new player add to render');
};

Render.prototype.removePlayer = function (id) {
    if (id in this.playersRender) {
        //remove from stage
        this.stage.removeChild(this.playersRender[id].shape);
        this.stage.removeChild(this.playersRender[id].text);
        //remove from playersRender array
        delete this.playersRender[id];

        console.log('player removed from render');

    }
};

Render.prototype.update = function (delta) {
    for (var key in this.playersRender) {
        this.playersRender[key].update();
    }
};

module.exports = Render;
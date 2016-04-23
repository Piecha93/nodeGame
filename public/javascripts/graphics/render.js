var PlayerRender = require("./playerrender");

function Render() {
    this.renderer;
    this.stage;
    this.loader;
    this.playersRender = {};

}

Render.prototype.loadAssets = function (callback) {
    PIXI.loader.add('bunny', 'resources/images/bunny.png').load(function () {
        console.log("wczytane");
        callback();
    });
};

Render.prototype.init = function () {
    // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
    // which will try to choose the best renderer for the environment you are in.
    this.renderer = new PIXI.autoDetectRenderer(800, 600);

// The renderer will create a canvas element for you that you can then insert into the DOM.
    document.body.appendChild(this.renderer.view);

// You need to create a root container that will hold the scene you want to draw.
    this.stage = new PIXI.Container();
};

Render.prototype.newPlayer = function (player) {
    console.log("player2");
    //create new player render
    var playerRender = new PlayerRender();

    //set up player reference
    playerRender.player = player;

    // load the texture we need
    playerRender.shape = new PIXI.Sprite(PIXI.loader.resources["bunny"].texture);

    /*
     playerRender.shape = new PIXI.Graphics();
     playerRender.shape.lineStyle(2, 0xFF00FF);  //(thickness, color)
     playerRender.shape.drawCircle(0, 0, 10);   //(x,y,radius)
     playerRender.shape.endFill();*/

    playerRender.init();
    playerRender.update();
    // Add the bunny to the scene we are building.
    this.stage.addChild(playerRender.shape);
    // Add player to playersRender array
    this.playersRender[player.id] = playerRender;
};

Render.prototype.removePlayer = function (id) {
    if (id in this.playersRender) {
        //remove from stage
        this.stage.removeChild(this.playersRender[id].shape);
        //remove from playersRender array
        delete this.playersRender[id];

        console.log('player removed from render');
    }
};

Render.prototype.update = function (delta) {
    for (var key in this.playersRender) {
        this.playersRender[key].update();
    }

    this.renderer.render(this.stage);
};

module.exports = Render;
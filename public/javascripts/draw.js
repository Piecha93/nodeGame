//var players = require('./gamelogic').players;

var stage;

function init() {
    stage = new createjs.Stage("canvas");
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
   /* var player = new createjs.Shape()
    player.graphics.beginFill("Blue").drawCircle(0, 0, 50);
    player.x = 100;
    player.y = 100;
    stage.addChild(player);

    stage.updateLoop();

    console.log('draw completed');

    createjs.Tween.get(player, { loop: true})
        .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
        .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
        .to({ alpha: 0, y: 225 }, 100)
        .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
        .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));
    */
}

function update() {
    
}

//module.exports.update = update;

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a)return a(o, !0);
                if (i)return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {exports: {}};
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)s(r[o]);
    return s
})({
    1: [function (require, module, exports) {
        var socket = io.connect();
        var Game = require('./logic/gamelogic');
        var InputHandler = require('./logic/inputhandler');
        var Draw = require('./graphics/render');

        var game = new Game();
        var draw = new Draw();

        var inputHandler = new InputHandler();

        var localPlayer;

        game.startGameLoop();

        socket.on('onconnected', function (data) {
            console.log('Connection to server succesfull. Your id is: ' + data.id);
            draw.init("canvas");
        });

        socket.on('updateLoop', function (data) {
            //console.log(data);
            updatePlayers(data.players);
        });

//updates local player depends on server data
        function updatePlayers(serverPlayers) {
            for (var key in serverPlayers) {
                var localPlayer = game.players[key];
                if (typeof localPlayer !== "undefined") {
                    localPlayer.update(serverPlayers[key]);
                }
                else {
                    localPlayer = game.newPlayer(serverPlayers[key].id, serverPlayers[key]);
                    draw.newPlayer(localPlayer);
                }
            }

            //delete players that server don't have
            for (var key in game.players) {
                if (!(key in serverPlayers)) {
                    draw.removePlayer(game.players[key].id);
                    delete game.players[key];
                }
            }
            draw.update();
        };


    }, {"./graphics/render": 3, "./logic/gamelogic": 5, "./logic/inputhandler": 6}],
    2: [function (require, module, exports) {
        function PlayerRender() {
            this.shape;
            this.player;
        }

        PlayerRender.prototype.init = function () {
            this.shape.graphics.beginFill("Blue").drawCircle(0, 0, 25);
        }

        PlayerRender.prototype.update = function () {
            this.shape.x = this.player.x;
            this.shape.y = this.player.y;

        };

        module.exports = PlayerRender;
    }, {}],
    3: [function (require, module, exports) {
        var PlayerRender = require("./playerrender");

        function Draw() {
            this.stage;
            this.playersRender = {};
        };

        Draw.prototype.init = function (canvas) {
            this.stage = new createjs.Stage(canvas);
            //  this.stage.updateLoop();

            console.log('draw init completed');
            createjs.Ticker.setFPS(60);
            createjs.Ticker.addEventListener("tick", this.stage);
        };

        Draw.prototype.newPlayer = function (player) {
            //create new player render
            var playerRender = new PlayerRender();

            //set up player reference
            playerRender.player = player;

            //create shape for player
            playerRender.shape = new createjs.Shape();

            playerRender.init();
            playerRender.update();

            this.playersRender[player.id] = playerRender;
            this.stage.addChild(playerRender.shape);

            console.log('new player add to render');
        };

        Draw.prototype.removePlayer = function (id) {
            if (id in this.playersRender) {
                //remove from stage
                this.stage.removeChild(this.playersRender[id].shape);
                //remove from playersRender array
                delete this.playersRender[id];

                console.log('player removed from render');

            }
        };

        Draw.prototype.update = function () {
            for (var key in this.playersRender) {
                this.playersRender[key].update();
            }
        };

        module.exports = Draw;
    }, {"./playerrender": 2}],
    4: [function (require, module, exports) {
        function DeltaTimer() {
            this.currentTime;
            this.delta;
            this.lastUpdate = new Date().getTime();
        };

        DeltaTimer.prototype.getDelta = function () {
            this.currentTime = new Date().getTime();
            this.delta = this.currentTime - this.lastUpdate;
            this.lastUpdate = this.currentTime;

            return this.delta;
        };

        module.exports = DeltaTimer;
    }, {}],
    5: [function (require, module, exports) {
        var Player = require('./player');
        var DeltaTimer = require('./detlatimer');

        var timer = new DeltaTimer();

        function Game() {
            this.players = {};

            this.dd = 'asdddwwwwwwwwwwwwww';
        }

        Game.prototype.startGameLoop = function () {
            gameLoop(this);
        };

//creates new player
        Game.prototype.newPlayer = function (id, newPlayer) {
            var player = new Player();
            player.id = id;
            //this.players.push(player);

            if (typeof newPlayer !== "undefined") {
                player.x = newPlayer.x;
                player.y = newPlayer.y;
            }

            this.players[player.id] = player;

            return player;
        };


        Game.prototype.removePlayer = function (id) {
            //var indexToRemove = this.players.indexOf(id);
            //this.players.splice(indexToRemove, 1);
            delete this.players[id];

            for (var key in this.players) {
                console.log('dd' + this.players[key].x);
            }
        };

        function gameLoop(self) {
            var delta = timer.getDelta();
            handleInput();
            update();

            setTimeout(function () {
                gameLoop(self);
            }, 100);
        };

        function handleInput(player, input) {

        };

        function update() {

        };

        module.exports = Game;

    }, {"./detlatimer": 4, "./player": 7}],
    6: [function (require, module, exports) {
        function InputHandler() {
            this.inputArray = [];
            var self = this;
            document.onkeydown = function (event) {
                self.keyPressed(event);
            };
        };

        InputHandler.prototype.keyPressed = function (event) {
            this.inputArray.push(event.keyCode);
            console.log('input: ' + this.inputArray);
        };

        module.exports = InputHandler;
    }, {}],
    7: [function (require, module, exports) {
        function Player() {
            this.x = Math.random() * 300;
            this.y = Math.random() * 300;
            ;
            this.id = 0;
        }

        Player.prototype.move = function (x, y) {
            this.x += x;
            this.y += y;
        };

        Player.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };

        Player.prototype.update = function (player) {
            this.x = player.x;
            this.y = player.y;
        };

        module.exports = Player;
    }, {}]
}, {}, [1]);

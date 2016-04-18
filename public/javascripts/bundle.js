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
        var Render = require('./graphics/render');

        var tickrate = 64;

        var game = new Game();
        var render = new Render();

        var localId = -1;

        socket.on('onconnected', function (data) {
            console.log('Connection to server succesfull. Your id is: ' + data.id);
            render.init("canvas");
            localId = data.id;

            game.startGameLoop();
            serverUpdateLoop();
        });

        socket.on('serverUpdate', function (data) {
            //console.log(data);
            updatePlayers(data.players);
        });

//send update to server
        function serverUpdateLoop() {
            if (game.players[localId] != undefined)
                socket.emit('clientUpdate', {input: game.players[localId].input});

            setTimeout(serverUpdateLoop, 1 / tickrate * 1000);
            render.update();
            //console.log('updating clients' + new Date().getTime());
        };

//updates local player depends on server data
        function updatePlayers(serverPlayers) {
            for (var key in serverPlayers) {
                var localPlayer = game.players[key];
                if (typeof localPlayer !== "undefined") {
                    localPlayer.serverUpdate(serverPlayers[key]);
                }
                else {
                    localPlayer = game.newPlayer(serverPlayers[key].id, serverPlayers[key]);
                    render.newPlayer(localPlayer);
                }
            }

            //delete players that server don't have
            for (var key in game.players) {
                if (!(key in serverPlayers)) {
                    render.removePlayer(game.players[key].id);
                    delete game.players[key];
                }
            }
        };


    }, {"./graphics/render": 3, "./logic/gamelogic": 5}], 2: [function (require, module, exports) {
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
    }, {}], 3: [function (require, module, exports) {
        var PlayerRender = require("./playerrender");

        function Render() {
            this.stage;
            this.playersRender = {};
        };

        Render.prototype.init = function (canvas) {
            this.stage = new createjs.Stage(canvas);
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

            playerRender.init();
            playerRender.update();

            this.playersRender[player.id] = playerRender;
            this.stage.addChild(playerRender.shape);

            console.log('new player add to render');
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

        Render.prototype.update = function () {
            for (var key in this.playersRender) {
                this.playersRender[key].update();
            }
        };

        module.exports = Render;
    }, {"./playerrender": 2}], 4: [function (require, module, exports) {
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
    }, {}], 5: [function (require, module, exports) {
        var Player = require('./player');
        var DeltaTimer = require('./detlatimer');

        var timer = new DeltaTimer();

        function Game() {
            this.players = {};
            //this.inputArray = {};
        }

        Game.prototype.startGameLoop = function () {
            gameLoop(this);
        };

//creates new player
        Game.prototype.newPlayer = function (id, newPlayer) {
            var player = new Player();
            player.id = id;

            if (typeof newPlayer !== "undefined") {
                player.x = newPlayer.x;
                player.y = newPlayer.y;
            }

            this.players[player.id] = player;

            return player;
        };

        Game.prototype.removePlayer = function (id) {
            delete this.players[id];
        };

        function gameLoop(self) {
            var delta = timer.getDelta();
            self.handleInput(delta);
            self.update(delta);

            setTimeout(function () {
                gameLoop(self);
            }, 10);
        };

        Game.prototype.handleInput = function (delta) {
            for (var key in this.players) {
                this.players[key].handleInput();
            }
        };

        Game.prototype.update = function (delta) {
            //update players
            for (var key in this.players) {
                this.players[key].update(delta);
            }
        };

        module.exports = Game;

    }, {"./detlatimer": 4, "./player": 7}], 6: [function (require, module, exports) {
        function InputHandler() {
            this.inputArray = [];
            var self = this;
            this.isServer = true;
            //if document if undefined we are on server and dont need read keys
            if (typeof document !== 'undefined') {
                this.isServer = false;
                document.onkeydown = function (event) {
                    self.keyPressed(event);
        };
                document.onkeyup = function (event) {
                    self.keyReleased(event);
                }
            }
        };

//event listener for press key
//add keycode to input array
        InputHandler.prototype.keyPressed = function (event) {
            //accepy only input code that is not in array already
            if (this.inputArray.indexOf(event.keyCode) == -1)
                this.inputArray.push(event.keyCode);

            console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.keyReleased = function (event) {
            var index = this.inputArray.indexOf(event.keyCode);
            if (index > -1) {
                this.inputArray.splice(index, 1);
            }
            console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.handleClientInput = function () {
            /* if (!this.isServer) {
             var inputCopy = this.inputArray.slice();
             this.inputArray = [];
             return inputCopy;
             }
             return [];*/
            return this.inputArray;
        };

        module.exports = InputHandler;
    }, {}], 7: [function (require, module, exports) {
        var InputHandler = require('./inputhandler');

        var HorizontalDir = {none: 0, left: -1, right: 1};
        var VerticalDir = {none: 0, up: -1, down: 1};

        function Player() {
            this.x = Math.random() * 300;
            this.y = Math.random() * 300;
            this.input = [];
            this.horizontalDir = HorizontalDir.none;
            this.verticalDir = VerticalDir.none;
            this.speed = 0.1;
            this.id = 0;

            this.inputHandler = new InputHandler();
        }

        /*
         Player.prototype.move = function (x, y) {
         this.x += x;
         this.y += y;
         };*/

//get and store input from inputhandler
        Player.prototype.handleInput = function () {
            if (!this.inputHandler.isServer) {
                this.input = this.inputHandler.handleClientInput();
            }

            this.horizontalDir = HorizontalDir.none;
            this.verticalDir = VerticalDir.none;

            var self = this;
            this.input.forEach(function (i) {
                switch (i) {
                    case 37:
                        self.horizontalDir = HorizontalDir.left;
                        break;
                    case 39:
                        self.horizontalDir = HorizontalDir.right;
                        break;
                    case 38:
                        self.verticalDir = VerticalDir.up;
                        break;
                    case 40:
                        self.verticalDir = VerticalDir.down;
                        break;
        }
            });
        };

//set player position to x, y
        Player.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };

//update player position depends on delta and movedir
        Player.prototype.update = function (delta) {
            var offset = this.speed * delta;
            this.x += this.horizontalDir * offset;
            this.y += this.verticalDir * offset;
        }

        Player.prototype.serverUpdate = function (player) {
            this.x = player.x;
            this.y = player.y;
        };

        module.exports = Player;
    }, {"./inputhandler": 6}]
}, {}, [1]);

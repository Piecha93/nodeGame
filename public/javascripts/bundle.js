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
        var Game = require('./logic/gamelogic');
        var Render = require('./graphics/render');

//number of times per secound sending packets to server
        var updateTickRate = 32;

        var heartBeatsRate = 3;
        var heartBeatsTimer = 0;

        var game = new Game();
        var render = new Render();

        var localId = -1;

        var socket = io.connect();

        socket.on('onconnected', function (data) {
            console.log('Connection to server succesfull. Your id is: ' + data.id);
            render.init("canvas");
            localId = data.id;

            //start game loop when connected to server
            game.startGameLoop();
            //set render to game logic update
            game.setRender(render);
            //create local player with id from server
            var localPlayer = game.newPlayer(localId);
            localPlayer.setUpInputHandler();
            //add player to render
            render.newPlayer(localPlayer);

            startServerUpdateLoop();
        });

        function startServerUpdateLoop() {
            serverUpdateLoop();
            setTimeout(startServerUpdateLoop, 1 / updateTickRate * 1000);
        }

//get update from server
        socket.on('serverUpdate', function (data) {
            //console.log(data);
            if (data.players !== undefined)
                updatePlayers(data.players);
            if (data.disconnectedClients.length > 0)
                deletePlayers(data.disconnectedClients);
        });

//send update to server
        function serverUpdateLoop() {
            var update = {};
            //if local player exist and has new input to send
            if (game.players[localId] != undefined && game.players[localId].inputHandler.isChanged) {
                game.players[localId].inputHandler.isChanged = false;
                update.input = game.players[localId].input;
            }
            if (heartBeatsTimer >= 1 / heartBeatsRate * 1000) {
                heartBeatsTimer = 0;
            } else {
                heartBeatsTimer += 1 / updateTickRate * 1000
            }

            if (Object.keys(update).length !== 0) {
                socket.emit('clientUpdate', update);
            }
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
        };

        function deletePlayers(disconnected) {
            console.log('usuwam');
            disconnected.forEach(function (id) {
                render.removePlayer(id);
                game.removePlayer(id);
            });
        }

        var backgroundInterval;
        window.onfocus = function () {
            clearInterval(backgroundInterval);
        };

        window.onblur = function () {
            if (localId != -1) {
                game.players[localId].inputHandler.resetInput();
                serverUpdateLoop();
            }
            backgroundInterval = setInterval(function () {
                socket.emit('clientUpdate', {});
            }, 1000);
        };


    }, {"./graphics/render": 3, "./logic/gamelogic": 5}], 2: [function (require, module, exports) {
        function PlayerRender() {
            this.shape;
            this.shapeTween;

            this.text;
            this.textTween

            this.player;
        }

        PlayerRender.prototype.init = function () {
            this.shape.graphics.beginFill("Pink").drawCircle(0, 0, 25);
            // this.shapeTween = createjs.Tween.get(this.shape);

            this.text.textAlign = "center";
            this.text.text = this.player.id;
            //  this.textTween = createjs.Tween.get(this.text);

        };

        PlayerRender.prototype.update = function () {
            // this.shape.x = this.player.x;
            // this.shape.y = this.player.y;
            createjs.Tween.get(this.shape).to({x: this.player.x, y: this.player.y}, 0);
            createjs.Tween.get(this.text).to({x: this.player.x, y: this.player.y}, 0);
        };

        module.exports = PlayerRender;


        function Animal() {
            this.getName = function () {
                return "animal";
            }
        }

        /*
         function Cat() {
         this.getName = function () {
         return "cat";
         }
         }

         Cat.prototype = new Animal();
         */
    }, {}], 3: [function (require, module, exports) {
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

        var tickRate = 128;

        function Game() {
            this.players = {};
            this.renderHandler = null;
        }

        Game.prototype.startGameLoop = function () {
            gameLoop(this);
        };

        function gameLoop(self) {
            var delta = timer.getDelta();
            self.handleInput(delta);
            self.update(delta);
            self.render(delta);

            setTimeout(function () {
                gameLoop(self);
            }, 1 / tickRate * 1000);
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

        Game.prototype.render = function (delta) {
            if (this.renderHandler != null) {
                this.renderHandler.update(delta);
            }
        };

        Game.prototype.setRender = function (render) {
            this.renderHandler = render;
        }

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

        Game.prototype.setTickRate = function (tr) {
            tickRate = tr;
        };

        Game.prototype.getTickRate = function () {
            return tickRate;
        };

        module.exports = Game;

    }, {"./detlatimer": 4, "./player": 7}], 6: [function (require, module, exports) {
        var validInputs = [
            39, //right
            37, //left
            38, //up
            40  //down
        ];

        function isInputValid(inputCode) {
            if (validInputs.indexOf(inputCode) != -1) {
                return true;
            }

            return false;
        }

        function InputHandler() {
            this.isChanged = false;
            this.inputArray = [];
            var self = this;
            //if document if undefined we are on server and dont need read keys
            if (typeof document !== 'undefined') {
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
            if (this.inputArray.indexOf(event.keyCode) == -1 && isInputValid(event.keyCode)) {
                this.inputArray.push(event.keyCode);
                this.isChanged = true;
            }
            console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.keyReleased = function (event) {
            var index = this.inputArray.indexOf(event.keyCode);
            if (index > -1) {
                this.inputArray.splice(index, 1);
                this.isChanged = true;
            }
            //console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.handleClientInput = function () {
            return this.inputArray;
        };

        InputHandler.prototype.resetInput = function () {
            this.inputArray.splice(0, this.inputArray.length);
            this.isChanged = true;
        }

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
            this.speed = 0.3;
            this.inputHandler = false;
            this.isChanged = true;
            this.id = -1;
        }

//create new input handler
        Player.prototype.setUpInputHandler = function () {
            this.inputHandler = new InputHandler();
        };


        Player.prototype.handleInput = function () {
            //inputHandler exist only on client local player (never on server)
            if (this.inputHandler) {
                this.input = this.inputHandler.handleClientInput();
            }

            this.horizontalDir = HorizontalDir.none;
            this.verticalDir = VerticalDir.none;

            var self = this;
            this.input.forEach(function (i) {
                self.isChanged = true;
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
        };

        Player.prototype.serverUpdate = function (player) {
            this.x = player.x;
            this.y = player.y;
        };

        module.exports = Player;
    }, {"./inputhandler": 6}]
}, {}, [1]);

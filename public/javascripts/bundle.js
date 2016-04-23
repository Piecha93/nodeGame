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

        var render = new Render();
        var game = new Game();

        var localId = -1;

//make callback when loaded
        render.loadAssets(function () {
            var socket = io.connect();

            socket.on('onconnected', function (data) {
                render.init();

                console.log('Connection to server succesfull. Your id is: ' + data.id);
                localId = data.id;

                //start game loop when connected to server
                game.startGameLoop();
                //set render to game logic update
                game.setRender(render);
                //create local player with id from server
                var localPlayer = game.newPlayer(localId);
                localPlayer.setUpInputHandler();
                startServerUpdateLoop();
                //add player to render
                render.newPlayer(localPlayer);
            });

            //get update from server
            socket.on('serverUpdate', function (data) {
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
                console.log(serverPlayers);
                for (var key in serverPlayers) {
                    var localPlayer = game.players[key];
                    if (typeof localPlayer !== "undefined") {
                        localPlayer.serverUpdate(serverPlayers[key]);
            }
                    else {
                        console.log("playerrrrr")
                        localPlayer = game.newPlayer(key, serverPlayers[key]);
                        render.newPlayer(localPlayer);
            }
        }
            };

            function deletePlayers(disconnected) {
                disconnected.forEach(function (id) {
                    render.removePlayer(id);
                    game.removePlayer(id);
                });
            };

            function startServerUpdateLoop() {
                serverUpdateLoop();
                setTimeout(startServerUpdateLoop, 1 / updateTickRate * 1000);
            }

            var backgroundInterval;
            window.onfocus = function () {
                clearInterval(backgroundInterval);
            };

            window.onblur = function () {
                if (localId != -1 && game.players[localId].inputHandler != undefined) {
                    game.players[localId].inputHandler.resetInput();
                    serverUpdateLoop();
        }
                backgroundInterval = setInterval(function () {
                    socket.emit('clientUpdate', {});
                }, 1000);
            };
        });


    }, {"./graphics/render": 3, "./logic/gamelogic": 5}], 2: [function (require, module, exports) {
        function PlayerRender() {
            this.currentAnimation = null;
            this.text = null;
            this.player = null;

            this.framesLeft = [];
            this.framesRight = [];
            this.framesUp = [];
            this.framesDown = [];

            this.dir = "left";

        }

        PlayerRender.prototype.init = function () {
            this.currentAnimation.animationSpeed = this.player.speed / 2;
        };

        PlayerRender.prototype.update = function () {
            console.log(this.player.horizontalMove);
            if (this.player.horizontalMove == -1) {
                this.currentAnimation.textures = this.framesLeft;
                this.currentAnimation.play();
            } else if (this.player.horizontalMove == 1) {
                this.currentAnimation.textures = this.framesRight;
                this.currentAnimation.play();
            } else if (this.player.verticalMove == -1) {
                this.currentAnimation.textures = this.framesUp;
                this.currentAnimation.play();
            } else if (this.player.verticalMove == 1) {
                this.currentAnimation.textures = this.framesDown;
                this.currentAnimation.play();
            } else {
                this.currentAnimation.stop();
            }

            this.currentAnimation.x = this.player.x;
            this.currentAnimation.y = this.player.y;
            //createjs.Tween.get(this.shape).to({x: this.player.x, y: this.player.y}, 0);
            //createjs.Tween.get(this.text).to({x: this.player.x, y: this.player.y}, 0);
        };

        module.exports = PlayerRender;
    }, {}], 3: [function (require, module, exports) {
        var PlayerRender = require("./playerrender");

        function Render() {
            this.renderer;
            this.stage;
            this.loader;
            this.playersRender = {};

        }

        Render.prototype.loadAssets = function (callback) {
            PIXI.loader.add('bunny', 'resources/images/bunny.png').add('resources/images/panda.json').load(function () {
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
            //create new player render
            var playerRender = new PlayerRender();

            //set up player reference
            playerRender.player = player;
            var framesLeft = [];
            var framesRight = [];
            var framesUp = [];
            var framesDown = [];

            // load the texture we need
            playerRender.shape = new PIXI.Sprite(PIXI.loader.resources["bunny"].texture);
            for (var i = 1; i < 5; i++) {
                // magically works since the spritesheet was loaded with the pixi loader
                playerRender.framesLeft.push(PIXI.Texture.fromFrame('left' + i + '.png'));
                playerRender.framesRight.push(PIXI.Texture.fromFrame('right' + i + '.png'));
                playerRender.framesUp.push(PIXI.Texture.fromFrame('up' + i + '.png'));
                playerRender.framesDown.push(PIXI.Texture.fromFrame('down' + i + '.png'));
            }

            playerRender.currentAnimation = new PIXI.extras.MovieClip(playerRender.framesDown);

            this.stage.addChild(playerRender.currentAnimation);

            playerRender.init();
            playerRender.update();
            // Add the bunny to the scene we are building.
            // Add player to playersRender array
            this.playersRender[player.id] = playerRender;
        };

        Render.prototype.removePlayer = function (id) {
            if (id in this.playersRender) {
                //remove from stage
                this.stage.removeChild(this.playersRender[id].currentAnimation);
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

        Game.prototype.handleInput = function () {
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
            //console.log('input: ' + this.inputArray);
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

            this.horizontalMove = HorizontalDir.none;
            this.verticalMove = VerticalDir.none;
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

            if (this.horizontalDir != 0 || this.verticalDir != 0) {
                this.horizontalDir = HorizontalDir.none;
                this.verticalDir = VerticalDir.none;
                this.isChanged = true;
            }

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

//update player position depends on delta and movedir
        Player.prototype.update = function (delta) {
            var offset = this.speed * delta;
            if (this.verticalDir != 0 && this.horizontalDir != 0)
                offset = offset * Math.sin(45 * (180 / Math.PI));
            this.x += this.horizontalDir * offset;
            this.y += this.verticalDir * offset;
        };

//set player position to x, y
        Player.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };

        Player.prototype.serverUpdate = function (playerUpdateInfo) {
            this.setPosition(playerUpdateInfo.x, playerUpdateInfo.y);
            this.horizontalMove = playerUpdateInfo.horizontalMove;
            this.verticalMove = playerUpdateInfo.verticalMove;
        };

        Player.prototype.getUpdateInfo = function () {
            var playerUpdateInfo = {};
            playerUpdateInfo.x = this.x;
            playerUpdateInfo.y = this.y;
            playerUpdateInfo.horizontalMove = this.horizontalDir;
            playerUpdateInfo.verticalMove = this.verticalDir;

            return playerUpdateInfo;
        };

        module.exports = Player;
    }, {"./inputhandler": 6}]
}, {}, [1]);

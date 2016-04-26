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
        var Game = require('./logic/game/gamelogic');
        var Render = require('./graphics/render');
        var InputHandler = require('./logic/inputhandler');
        var Messenger = require('./logic/chat/messenger');

//number of times per secound sending packets to server
        var updateTickRate = 20;

//variables to check server response time (ping)
        var heartBeatsRate = 1;
        var heartBeatsTimer = 0;
        var heartBeat = {
            id: 1,
            time: 0
        };
        var ping = 0;

        var render = new Render();
        var game = new Game();
        var inputHandler = new InputHandler(inputHandlerCallback);
        var messenger = new Messenger();

        var localId = -1;
        var socket = io.connect();

//make callback when loaded
        render.loadAssets(function () {
            socket.emit('connected');
        });

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

            startServerUpdateLoop();
            startServerHeartbeatUpdateLoop();
            //add player to render
            render.newPlayer(localPlayer);
        });

//get update from server
        socket.on('serverUpdate', function (data) {
            if (data.players !== undefined)
                updatePlayers(data.players);
            if (data.disconnectedClients.length > 0)
                deletePlayers(data.disconnectedClients);
            if (data.messages != undefined) {
                messenger.pushMessages(data.messages);
            }
        });

        socket.on('heartbeatsresponse', function (data) {
            ping = new Date().getTime() - heartBeat.time;
            //console.log('Packet ' + data.id + ' reciver after ' + ping + ' (ms)');
        });

//send heartbeats
        function serverHeartbeatsLoop() {
            if (heartBeatsTimer >= 1 / heartBeatsRate * 1000) {
                heartBeatsTimer = 0;
                heartBeat.time = new Date().getTime();
                socket.emit('heartbeat', {id: heartBeat.id});
                heartBeat.id++;
            } else {
                heartBeatsTimer += 1 / heartBeatsRate * 1000
            }
        };

//send update to server
        function serverUpdateLoop() {
            var update = {};
            //if local player exist and has new input to send
            if (inputHandler.isChanged) {
                inputHandler.isChanged = false;
                update.input = game.players[localId].input;
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
                    localPlayer = game.newPlayer(key, serverPlayers[key]);
                    render.newPlayer(localPlayer);
                }
            }
        };

//delete disconnected players
        function deletePlayers(disconnected) {
            disconnected.forEach(function (id) {
                render.removePlayer(id);
                game.removePlayer(id);
            });
        };

        function startServerUpdateLoop() {
            serverUpdateLoop();
            setTimeout(startServerUpdateLoop, 1 / updateTickRate * 1000);
        };

        function startServerHeartbeatUpdateLoop() {
            serverHeartbeatsLoop();
            setTimeout(startServerHeartbeatUpdateLoop, 1 / heartBeatsRate * 1000);
        };

        window.onblur = function () {
            inputHandler.resetInput();
            serverUpdateLoop();
        };

        function inputHandlerCallback(input) {
            var player = game.getPlayer(localId);
            if (player != null)
                player.input = input;
        }

        /*
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
         */

    }, {"./graphics/render": 3, "./logic/chat/messenger": 5, "./logic/game/gamelogic": 7, "./logic/inputhandler": 9}],
    2: [function (require, module, exports) {
        function PlayerRender() {
            this.currentAnimation = null;
            this.text = null;
            this.player = null;

            this.framesLeft = [];
            this.framesRight = [];
            this.framesUp = [];
            this.framesDown = [];

            //1 - no lerp, >1 - lerp, do not set this to <1
            this.lerpRate = 10;
        }

        PlayerRender.prototype.init = function (spriteName) {
            for (var i = 1; i < 5; i++) {
                this.framesLeft.push(PIXI.Texture.fromFrame(spriteName + 'left' + i + '.png'));
                this.framesRight.push(PIXI.Texture.fromFrame(spriteName + 'right' + i + '.png'));
                this.framesUp.push(PIXI.Texture.fromFrame(spriteName + 'up' + i + '.png'));
                this.framesDown.push(PIXI.Texture.fromFrame(spriteName + 'down' + i + '.png'));
            }

            this.currentAnimation = new PIXI.extras.MovieClip(this.framesDown);
            this.currentAnimation.animationSpeed = this.player.speed / 2;

            this.text = new PIXI.Text(this.player.id, {fill: 0xff1010, align: 'center', font: '22px Arial'});
            this.text.x -= this.text.texture.width / 2;
            this.text.y -= 30;
            this.currentAnimation.addChild(this.text);
        };

        PlayerRender.prototype.update = function () {
            //animation update
            if (this.player.horizontalDir == -1 || this.player.horizontalMove == -1) {
                this.currentAnimation.textures = this.framesLeft;
                this.currentAnimation.play();
            } else if (this.player.horizontalDir == 1 || this.player.horizontalMove == 1) {
                this.currentAnimation.textures = this.framesRight;
                this.currentAnimation.play();
            } else if (this.player.verticalDir == -1 || this.player.verticalMove == -1) {
                this.currentAnimation.textures = this.framesUp;
                this.currentAnimation.play();
            } else if (this.player.verticalDir == 1 || this.player.verticalMove == 1) {
                this.currentAnimation.textures = this.framesDown;
                this.currentAnimation.play();
            } else {
                this.currentAnimation.stop();
            }

            //position update
            this.currentAnimation.x += (this.player.x - this.currentAnimation.x) / this.lerpRate;
            this.currentAnimation.y += (this.player.y - this.currentAnimation.y) / this.lerpRate;
        };

        module.exports = PlayerRender;
    }, {}],
    3: [function (require, module, exports) {
        var PlayerRender = require("./playerrender");

        function Render() {
            this.renderer;
            this.stage;
            this.objects = {};
        }

//load images
        Render.prototype.loadAssets = function (callback) {
            PIXI.loader.add('panda', 'resources/images/panda.json').load(function () {
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

        Render.prototype.update = function (delta) {
            for (var key in this.objects) {
                this.objects[key].update();
            }

            this.renderer.render(this.stage);
        };

        Render.prototype.newPlayer = function (player) {
            //create new player render
            var playerRender = new PlayerRender();

            //set up player reference
            playerRender.player = player;

            playerRender.init('panda');
            playerRender.update();

            this.stage.addChild(playerRender.currentAnimation);
            this.objects[player.id] = playerRender;
        };

        Render.prototype.removePlayer = function (id) {
            if (id in this.objects) {
                //remove from stage
                this.stage.removeChild(this.objects[id].currentAnimation);
                //remove from objects array
                delete this.objects[id];

                console.log('player removed from render');
            }
        };

        module.exports = Render;
    }, {"./playerrender": 2}],
    4: [function (require, module, exports) {
        function Message(content, authorId, authorName, sendTime) {
            this.content = content;
            this.authorId = authorId;
            this.authorName = authorName;
            this.sendTime = sendTime;
        }

        module.exports = Message;
    }, {}],
    5: [function (require, module, exports) {
        var Message = require("./message");

        function Messenger() {
            this.messageArray = [];
        }

        Messenger.prototype.addMessage = function (content, authorId, authorName) {
            this.messageArray.push(new Message(content, authorId, authorName));
        };

        Messenger.prototype.pushMessages = function (messages) {
            this.messageArray.concat(messages);
        };

        Messenger.prototype.getLast = function (number) {
            var arrayLength = this.messageArray.length;
            if (number > arrayLength) {
                number = arrayLength;
            }
            this.messageArray.slice(arrayLength - number, arrayLength);
        };

        module.exports = Messenger;
    }, {"./message": 4}],
    6: [function (require, module, exports) {
        function DeltaTimer(id) {
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
    7: [function (require, module, exports) {
        var Player = require('./player');
        var DeltaTimer = require('./detlatimer');

        var tickRate = 64;

        function Game() {
            this.players = {};
            this.renderHandler = null;
            this.timer = new DeltaTimer();
        }

        Game.prototype.startGameLoop = function () {
            this.gameLoop();
        };

        Game.prototype.gameLoop = function () {
            var delta = this.timer.getDelta();
            this.handleInput(delta);
            this.update(delta);
            this.render(delta);

            var self = this;
            setTimeout(function () {
                self.gameLoop();
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

        Game.prototype.setTickRate = function (tr) {
            tickRate = tr;
        };

        Game.prototype.getTickRate = function () {
            return tickRate;
        };

        Game.prototype.getPlayer = function (id) {
            if (this.players[id] != undefined) {
                return this.players[id];
            }
            return null;
        };

        module.exports = Game;

    }, {"./detlatimer": 6, "./player": 8}],
    8: [function (require, module, exports) {
        var HorizontalDir = {none: 0, left: -1, right: 1};
        var VerticalDir = {none: 0, up: -1, down: 1};

        function Player() {
            this.x = 0;
            this.y = 0;
            this.input = [];
            this.horizontalDir = HorizontalDir.none;
            this.verticalDir = VerticalDir.none;
            this.speed = 0.15;
            this.isChanged = true;
            this.id = -1;

            this.horizontalMove = HorizontalDir.none;
            this.verticalMove = VerticalDir.none;
        }

        Player.prototype.handleInput = function () {
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
                    case 65:
                        self.horizontalDir = HorizontalDir.left;
                        break;
                    case 39:
                    case 68:
                        self.horizontalDir = HorizontalDir.right;
                        break;
                    case 38:
                    case 87:
                        self.verticalDir = VerticalDir.up;
                        break;
                    case 40:
                    case 83:
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
            console.log('local: ' + this.x + ' server: ' + playerUpdateInfo.x);
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
    }, {}],
    9: [function (require, module, exports) {
        var validInputs = [
            39, 68, //right
            37, 65, //left
            38, 83, //up
            40, 87  //down
        ];

        function isInputValid(inputCode) {
            if (validInputs.indexOf(inputCode) != -1) {
                return true;
            }

            return false;
        }

        function InputHandler(callback) {
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

            this.callback = callback;
        };

//event listener for press key
//add keycode to input array
        InputHandler.prototype.keyPressed = function (event) {
            //accepy only input code that is not in array already
            if (this.inputArray.indexOf(event.keyCode) == -1 && isInputValid(event.keyCode)) {
                this.inputArray.push(event.keyCode);
                this.isChanged = true;
                this.callback(this.inputArray);
            }
            console.log('input: ' + event.keyCode);
        };

        InputHandler.prototype.keyReleased = function (event) {
            var index = this.inputArray.indexOf(event.keyCode);
            if (index > -1) {
                this.inputArray.splice(index, 1);
                this.isChanged = true;
                this.callback(this.inputArray);
            }
            //console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.handleClientInput = function () {
            return this.inputArray;
        };

        InputHandler.prototype.resetInput = function () {
            this.inputArray.splice(0, this.inputArray.length);
            this.isChanged = true;
        };

        module.exports = InputHandler;
    }, {}]
}, {}, [1]);

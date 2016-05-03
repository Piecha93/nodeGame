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
        var update;
        resetUpdate();

//variables to check server response time (ping)
        var heartBeatsRate = 1;
        var heartBeatsTimer = 0;
        var heartBeat = {
            id: 1,
            time: 0
        };
        var ping = 0;

        var render = new Render(assetsLoadedCallback);
        var game = new Game();
        var inputHandler = new InputHandler(inputHandlerCallback);
        var messenger = new Messenger();

        var localId = -1;
        var name = "";
        var socket = io.connect();

        function assetsLoadedCallback() {
            socket.emit('connected');
        }

        socket.on('startgame', function (client) {
            localId = client.id;
            name = client.name;

            //start game loop when connected to server
            game.startGameLoop();
            //set render to game logic update
            game.setRender(render);
            //create local player with id from server
            var localPlayer = game.newPlayer(localId);
            localPlayer.name = name;

            startServerUpdateLoop();
            startServerHeartbeatUpdateLoop();
            //add player to render
            render.newPlayer(localPlayer);

            console.log('Connection to server succesfull. Your id is: ' + client.id);
        });

//get update from server
        socket.on('serverupdate', function (data) {
            if (data.players !== undefined)
                updatePlayers(data.players);
            if (data.disconnectedClients.length > 0)
                deletePlayers(data.disconnectedClients);
        });

        socket.on('servermessage', function (message) {
            console.log("ms");
            console.log(message);
            updateMessenger(message);
        });

        socket.on('heartbeatsresponse', function (data) {
            ping = new Date().getTime() - heartBeat.time;
            //console.log('Packet ' + data.id + ' reciver after ' + ping + ' (ms)');
        });

//send heartbeats to keep connection alive
        function serverHeartbeatsLoop() {
            if (heartBeatsTimer >= 1 / heartBeatsRate * 1000) {
                heartBeatsTimer = 0;
                heartBeat.time = new Date().getTime();
                socket.emit('heartbeat', {id: heartBeat.id});
                heartBeat.id++;
            } else {
                heartBeatsTimer += 1 / heartBeatsRate * 1000
            }
        }

//send update to server
        function serverUpdateLoop() {
            if (!update.isEmpty) {
                socket.emit('clientupdate', update);
                resetUpdate();
            }
            //console.log('updating clients' + new Date().getTime());
        }

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
        }

        function updateMessenger(message) {
            messenger.addMessage(message.content, message.authorName);
        }

//delete disconnected players
        function deletePlayers(disconnected) {
            disconnected.forEach(function (id) {
                render.removePlayer(id);
                game.removePlayer(id);
            });
        }

        function startServerUpdateLoop() {
            serverUpdateLoop();
            setTimeout(startServerUpdateLoop, 1 / updateTickRate * 1000);
        }

        function startServerHeartbeatUpdateLoop() {
            serverHeartbeatsLoop();
            setTimeout(startServerHeartbeatUpdateLoop, 1 / heartBeatsRate * 1000);
        }

        function resetUpdate() {
            update = {
                input: [],
                isEmpty: true
            };
        }

//clear input and send update when tab inactive
        window.onblur = function () {
            inputHandler.clearInput();
            serverUpdateLoop();
        };

        var chatMode = false;
        var message = "";

//this function is called when input handler got something
        function inputHandlerCallback(input) {
            //if enter pressed
            if (input[input.length - 1] == 13) {
                if (chatMode == true) {
                    var m = messenger.createMessage(message, name);
                    m.parseAddressee();
                    socket.emit('clientmessage', m);
                    chatMode = false;
        }
                else {
                    chatMode = true;
                    message = "";
                    input.pop();
        }
            } else if (chatMode == true) {
                message += String.fromCharCode(input.pop());
                console.log(message);
            } else {
                var player = game.getPlayer(localId);
                if (player != null) {
                    player.input = input;
                    update.input = input;
                    update.isEmpty = false;
        }
            }
        }
    }, {"./graphics/render": 3, "./logic/chat/messenger": 5, "./logic/game/gamelogic": 7, "./logic/inputhandler": 9}],
    2: [function (require, module, exports) {
        function PlayerRender() {
            this.player = null;
            this.sprite = null;
            this.text = null;
            //1 - no lerp, >1 - lerp, do not set this to <1
            this.lerpRate = 10;
        }

        PlayerRender.prototype.init = function (sprite) {
            this.animationSpeed = this.player.speed * 30;
            this.sprite = sprite;
            this.sprite.animations.add('left', ['left1.png', 'left2.png', 'left3.png', 'left4.png'], this.animationSpeed, true);
            this.sprite.animations.add('right', ['right1.png', 'right2.png', 'right3.png', 'right4.png'], this.animationSpeed, true);
            this.sprite.animations.add('up', ['up1.png', 'up2.png', 'up3.png', 'up4.png'], this.animationSpeed, true);
            this.sprite.animations.add('down', ['down1.png', 'down2.png', 'down3.png', 'down4.png'], this.animationSpeed, true);
        };

        PlayerRender.prototype.update = function () {
            //animation update
            if (this.player.horizontalDir == -1 || this.player.horizontalMove == -1) {
                this.sprite.animations.play('left');
            } else if (this.player.horizontalDir == 1 || this.player.horizontalMove == 1) {
                this.sprite.animations.play('right');
            } else if (this.player.verticalDir == -1 || this.player.verticalMove == -1) {
                this.sprite.animations.play('up');
            } else if (this.player.verticalDir == 1 || this.player.verticalMove == 1) {
                this.sprite.animations.play('down');
            } else {
                this.sprite.animations.stop();
            }

            //position update
            this.sprite.x += (this.player.x - this.sprite.x) / this.lerpRate;
            this.sprite.y += (this.player.y - this.sprite.y) / this.lerpRate;
        };

        module.exports = PlayerRender;
    }, {}],
    3: [function (require, module, exports) {
        var PlayerRender = require("./playerrender");

        function Render(callback) {
            this.onLoadCallback = callback;
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example',
                {preload: this.preload.bind(this), create: this.create, render: this.update});

            this.objects = {};
        }

//load images
        Render.prototype.preload = function () {
            //load assets
            this.game.load.atlasJSONHash('panda', 'resources/images/panda.png', 'resources/images/panda.json');
            //set callback
            this.game.load.onLoadComplete.add(this.onLoadCallback);
        };

        Render.prototype.create = function () {
            this.game.add.plugin(Fabrique.Plugins.InputField);

            var password = this.game.add.inputField(10, 90, {
                font: '18px Arial',
                fill: '#212121',
                fontWeight: 'bold',
                width: 150,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 6,
            });
        };

        Render.prototype.update = function (delta) {
            for (var key in this.objects) {
                this.objects[key].update();
            }

            //this.renderer.render(this.stage);
        };

        Render.prototype.newPlayer = function (player) {
            //create new player render
            var playerRender = new PlayerRender();

            //set up player reference
            playerRender.player = player;

            playerRender.init(this.game.add.sprite(0, 0, 'panda'));
            playerRender.update();

            this.objects[player.id] = playerRender;
        };

        Render.prototype.removePlayer = function (id) {
            if (id in this.objects) {
                //remove form game
                this.objects[id].sprite.destroy();
                //remove from objects array
                delete this.objects[id];

                console.log('player removed from render');
            }
        };

        module.exports = Render;
    }, {"./playerrender": 2}],
    4: [function (require, module, exports) {
        function Message(content, authorName) {
            this.content = content;
            this.authorName = authorName;
            this.sendTime = -1;
        }

        Message.prototype.append = function (content) {
            this.content = this.content + content;
        };

        Message.prototype.setContent = function (content) {
            this.content = content;
        };

        Message.prototype.parseAddressee = function () {
            var firstChar = this.content.charAt(0);
            if (firstChar == '!') {
                this.addressee = "shout";
            } else if (firstChar == '$') {
                this.addressee = "trade";
            } else if (firstChar == '#') {
                this.addressee = "party";
            } else if (firstChar == 'Q') {
                this.addressee = this.content.substr(1, this.content.indexOf(" ") - 1);
            } else if (firstChar == '/') {
                this.addressee = "command";
            } else {
                this.addressee = "all";
            }
            if (this.addressee != "all") {
                this.content = this.content.substr(1, this.content.length);
            }
            return this.addressee;
        };

        module.exports = Message;


    }, {}],
    5: [function (require, module, exports) {
        var Message = require("./message");

        function Messenger() {
            this.messageArray = [];
        }

//create and return message
        Messenger.prototype.createMessage = function (content, authorName) {
            return new Message(content, authorName);
        };

//create and add message to list
        Messenger.prototype.addMessage = function (content, authorName) {
            var message = this.createMessage(content, authorName);
            this.messageArray.push(message);

            return message;
        };

        Messenger.prototype.pushMessages = function (messages) {
            this.messageArray.concat(messages);
            console.log('concat  ');
            console.log(this.messageArray);
        };

//return x last messages
        Messenger.prototype.getLast = function (count) {
            var arrayLength = this.messageArray.length;
            if (count > arrayLength) {
                count = arrayLength;
            }
            this.messageArray.slice(arrayLength - count, arrayLength);
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

        function Game() {
            this.tickrate = 128;

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
            }, 1 / this.tickRate * 1000);
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
        Game.prototype.newPlayer = function (id, playerCopy) {
            var player = new Player();
            player.id = id;

            if (typeof playerCopy !== "undefined") {
                player.x = playerCopy.x;
                player.y = playerCopy.y;
                player.name = playerCopy.name;
            }
            this.players[player.id] = player;

            return player;
        };

        Game.prototype.removePlayer = function (id) {
            delete this.players[id];
        };

        Game.prototype.setTickRate = function (tr) {
            this.tickRate = tr;
        };

        Game.prototype.getTickRate = function () {
            return this.tickRate;
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
            this.name = "";

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
            //console.log('local: ' + this.x + ' server: ' + playerUpdateInfo.x);
            this.setPosition(playerUpdateInfo.x, playerUpdateInfo.y);
            this.horizontalMove = playerUpdateInfo.horizontalMove;
            this.verticalMove = playerUpdateInfo.verticalMove;
            this.name = playerUpdateInfo.name;
        };

        Player.prototype.getUpdateInfo = function () {
            var playerUpdateInfo = {};
            playerUpdateInfo.x = this.x;
            playerUpdateInfo.y = this.y;
            playerUpdateInfo.horizontalMove = this.horizontalDir;
            playerUpdateInfo.verticalMove = this.verticalDir;
            playerUpdateInfo.name = this.name;

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

            //callback is function to call when new input came
            this.callback = callback;
        };

//event listener for press key
//add keycode to input array
        InputHandler.prototype.keyPressed = function (event) {
            //accepy only input code that is not in array already
            if (this.inputArray.indexOf(event.keyCode) == -1) {// && isInputValid(event.keyCode)) {
                this.inputArray.push(event.keyCode);
                this.callback(this.inputArray);
            }
            // console.log('input: ' + event.keyCode);
        };

        InputHandler.prototype.keyReleased = function (event) {
            var index = this.inputArray.indexOf(event.keyCode);
            if (index > -1) {
                this.inputArray.splice(index, 1);
                this.callback(this.inputArray);
            }
            //console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.clearInput = function () {
            this.inputArray.splice(0, this.inputArray.length);
            this.callback(this.inputArray);
        };

        module.exports = InputHandler;
    }, {}]
}, {}, [1]);

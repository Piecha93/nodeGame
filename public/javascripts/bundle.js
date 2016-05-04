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
        var MessageBox = require('./logic/chat/messagebox');

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
        var ping = {
            value: 0
        };

        var render = new Render(assetsLoadedCallback);
        var game = new Game();
        var inputHandler = new InputHandler(inputHandlerCallback);
        var messageBox = new MessageBox();

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
            //add messageBox to render
            render.createMessageBox(messageBox);
            //add stats (ping) to render
            render.createStatsRender(ping);

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
            updateMessenger(message);
        });

        socket.on('heartbeatsresponse', function (data) {
            ping.value = new Date().getTime() - heartBeat.time;
            //console.log('Packet ' + data.id + ' reciver after ' + ping.value + ' (ms)');
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
            messageBox.addMessage(message.content, message.authorName, message.addressee);
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

//this function is called when input handler got something
//input is copy od inputhandler inputArray
        function inputHandlerCallback(input) {
            //if enter pressed
            if (input[input.length - 1] == 13) {
                //if chat mode if true we need to get message from canvas and send it to server
                if (chatMode == true) {
                    var message = render.endChat();
                    if (message != "") {
                        var m = messageBox.createMessage(message, name);
                        m.parseAddressee();
                        socket.emit('clientmessage', m);
            }
                    chatMode = false;
                    inputHandler.clearInput();
                    //if chat mode is false we entering chat mode
                } else {
                    render.enterChat();
                    chatMode = true;
        }
            } else if (chatMode == false) {
                var player = game.getPlayer(localId);
                if (player != null) {
                    player.input = input;
                    update.input = input;
                    update.isEmpty = false;
        }
            }
        }


    }, {
        "./graphics/render": 5,
        "./logic/chat/messagebox": 8,
        "./logic/game/gamelogic": 10,
        "./logic/inputhandler": 12
    }],
    2: [function (require, module, exports) {
        function MessageBoxRender(game, messageBox) {
            this.game = game;
            this.messageBox = messageBox;
            this.textGroup = null;

            this.colors = {
                all: 0xffffff,
                shout: 0xC65B08,
                whisper: 0x7A378B,
                system: 0xFF0000
            }
        }

        MessageBoxRender.prototype.init = function () {
            this.textGroup = this.game.add.group();
            for (var i = 0; i < 10; i++) {
                this.textGroup.add(this.game.add.text(0, this.game.height - i * 16 - 50, "", {
                    font: "14px Courier"
                }));
            }
        };

        MessageBoxRender.prototype.update = function () {
            var messages = this.messageBox.getLast(10);

            for (var i = 0; i < messages.length; i++) {
                var textHolder = this.textGroup.children[messages.length - i - 1];
                textHolder.text = messages[i].authorName + ': ' + messages[i].content;
                switch (messages[i].addressee) {
                    case 'all':
                        textHolder.fill = hexToString(this.colors.all);
                        break;
                    case 'system':
                        textHolder.fill = hexToString(this.colors.system);
                        break;
                    default:
                        //for whisper
                        textHolder.fill = hexToString(this.colors.whisper);
                        break;
        }
            }

        };

        MessageBoxRender.prototype.destroy = function () {
            this.textGroup.destroy(true, false);
        }

        function hexToString(hex) {
            return '#' + hex.toString(16);
        }

        module.exports = MessageBoxRender;
    }, {}],
    3: [function (require, module, exports) {
        /*
         render textarea for chat
         using CanvasInput library
         */
        function MessageInputRender(game) {
            this.game = game;
        }

        MessageInputRender.prototype.init = function () {
            var bitmap = this.game.add.bitmapData(300, 100);
            this.inputSprite = this.game.add.sprite(0, this.game.height - 35, bitmap);

            this.inputSprite.canvasInput = new CanvasInput({
                canvas: bitmap.canvas,
                fontSize: 14,
                fontFamily: 'Arial',
                fontColor: '#212121',
                fontWeight: 'bold',
                width: 400,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 3,
                boxShadow: '1px 1px 0px #fff',
                innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
                placeHolder: 'Press enter to write...'
            });
        };

        MessageInputRender.prototype.update = function () {

        };

        MessageInputRender.prototype.startTyping = function () {
            this.inputSprite.canvasInput.focus();
        };

        MessageInputRender.prototype.getTextAndReset = function () {
            var text = this.inputSprite.canvasInput.value();

            this.inputSprite.canvasInput.blur();
            this.inputSprite.canvasInput.value("");

            return text;
        };

        MessageInputRender.prototype.destroy = function () {
            this.inputSprite.canvasInput.destroy();
            this.inputSprite.destroy();
        };

        module.exports = MessageInputRender;
    }, {}],
    4: [function (require, module, exports) {
        /*
         player render
         */

        function PlayerRender(game) {
            this.game = game;
            this.player = null;
            this.sprite = null;
            this.nameText = null;
            //1 - no lerp, >1 - lerp, do not set this to <1
            this.lerpRate = 10;
        }

        PlayerRender.prototype.init = function () {
            this.sprite = this.game.add.sprite(0, 0, 'panda');
            this.animationSpeed = this.player.speed * 30;
            this.sprite.animations.add('left', ['left1.png', 'left2.png', 'left3.png', 'left4.png'], this.animationSpeed, true);
            this.sprite.animations.add('right', ['right1.png', 'right2.png', 'right3.png', 'right4.png'], this.animationSpeed, true);
            this.sprite.animations.add('up', ['up1.png', 'up2.png', 'up3.png', 'up4.png'], this.animationSpeed, true);
            this.sprite.animations.add('down', ['down1.png', 'down2.png', 'down3.png', 'down4.png'], this.animationSpeed, true);

            this.nameText = this.game.add.text(this.player.x, this.player.y, this.player.name, {
                font: "bold 16px Arial",
                fill: "#ffffff"
            });

            this.nameText.anchor.set(0.4)
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

            this.nameText.text = this.player.name;
            this.nameText.x += (this.player.x - this.nameText.x) / this.lerpRate;
            this.nameText.y += (this.player.y - 10 - this.nameText.y) / this.lerpRate;
        };

        PlayerRender.prototype.destroy = function () {
            this.sprite.destroy();
            this.nameText.destroy();
        };

        module.exports = PlayerRender;
    }, {}],
    5: [function (require, module, exports) {
        var PlayerRender = require("./playerrender");
        var MessageInputRender = require("./messageinputrender");
        var MessageBoxRender = require("./messageboxrender");
        var StatsRender = require("./statsrender");

        function Render(callback) {
            this.onLoadCallback = callback;
            this.text = null;
            this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
                {preload: this.preload.bind(this), create: this.create.bind(this)});

            this.objects = {};
            this.messageBoxRender = null;
            this.messageInputRender = null;
            this.statsRender = null;
        }

//load images
        Render.prototype.preload = function () {
            //load assets
            this.game.load.atlasJSONHash('panda', 'resources/images/panda.png', 'resources/images/panda.json');
            //set callback
            this.game.load.onLoadComplete.add(this.onLoadCallback);
        };

        Render.prototype.create = function () {
        };

        Render.prototype.createMessageBox = function (messageBox) {
            //create MessengerBox
            this.messageBoxRender = new MessageBoxRender(this.game, messageBox);

            this.messageBoxRender.init();

            //create messageInputRender
            this.messageInputRender = new MessageInputRender(this.game);
            this.messageInputRender.init();
        };

        Render.prototype.destroyMessageBox = function () {
            this.messageBoxRender.destroy();
            this.messageInputRender.destroy();

            this.messageInputRender = null;
            this.messageBoxRender = null;
        }

        Render.prototype.enterChat = function () {
            if (this.messageInputRender != null) {
                this.messageInputRender.startTyping();
            }
        };

        Render.prototype.endChat = function () {
            if (this.messageInputRender != null) {
                return this.messageInputRender.getTextAndReset();
            }
        };

        Render.prototype.createStatsRender = function (ping) {
            this.statsRender = new StatsRender(this.game, ping);
            this.statsRender.init();
        };

        Render.prototype.destroyStatsRender = function () {
            this.statsRender.destroy();
            this.statsRender = null;
        };

        Render.prototype.newPlayer = function (player) {
            //create new player render
            var playerRender = new PlayerRender(this.game);

            //set up player reference
            playerRender.player = player;

            playerRender.init();

            this.objects[player.id] = playerRender;
        };

        Render.prototype.removePlayer = function (id) {
            if (id in this.objects) {
                //remove form game
                this.objects[id].destroy();
                //remove from objects array
                delete this.objects[id];

                console.log('player removed from render');
            }
        };

        Render.prototype.update = function (delta) {
            for (var key in this.objects) {
                this.objects[key].update();
            }
            if (this.messageBoxRender != null) {
                this.messageBoxRender.update();
            }
            if (this.statsRender != null) {
                this.statsRender.update();
            }
        };

        module.exports = Render;
    }, {"./messageboxrender": 2, "./messageinputrender": 3, "./playerrender": 4, "./statsrender": 6}],
    6: [function (require, module, exports) {
        /*
         render textarea for chat
         using CanvasInput library
         */
        function StarsRender(game, ping) {
            this.pingText = null;
            this.ping = ping
            this.game = game;
        }

        StarsRender.prototype.init = function (pingText) {
            this.pingText = this.game.add.text(this.game.width - 100, 0, "", {
                font: "bold 16px Arial",
                fill: "#ffffff"
            });
        };

        StarsRender.prototype.update = function () {
            this.pingText.text = "Ping: " + this.ping.value.toString(10) + "ms";
        };

        StarsRender.prototype.destroy = function () {
            this.pingText.destroy();
        };

        module.exports = StarsRender;
    }, {}],
    7: [function (require, module, exports) {
        function Message(content, authorName, addressee) {
            this.content = content;
            this.authorName = authorName;
            this.sendTime = -1;
            if (addressee != undefined) {
                this.addressee = addressee;
            } else {
                this.addressee = "";
            }
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
            } else if (firstChar == '"') {
                this.addressee = this.content.substr(1, this.content.indexOf(" ") - 1);
                this.content = this.content.substr(this.content.indexOf(" "), this.content.length);
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
    8: [function (require, module, exports) {
        var Message = require("./message");

        function MessageBox() {
            this.messageArray = [];
        }

//create and return message
        MessageBox.prototype.createMessage = function (content, authorName, addressee) {
            return new Message(content, authorName, addressee);
        };

//create and add message to list
        MessageBox.prototype.addMessage = function (content, authorName, addressee) {
            var message = this.createMessage(content, authorName, addressee);
            this.messageArray.push(message);

            return message;
        };

        MessageBox.prototype.pushMessages = function (messages) {
            this.messageArray.concat(messages);
            console.log('concat  ');
            console.log(this.messageArray);
        };

//return x last messages
        MessageBox.prototype.getLast = function (count) {
            var arrayLength = this.messageArray.length;
            if (count > arrayLength) {
                count = arrayLength;
            }
            return this.messageArray.slice(arrayLength - count, arrayLength);
        };

        module.exports = MessageBox;
    }, {"./message": 7}],
    9: [function (require, module, exports) {
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
    10: [function (require, module, exports) {
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

    }, {"./detlatimer": 9, "./player": 11}],
    11: [function (require, module, exports) {
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
    12: [function (require, module, exports) {
        /*var validInputs = [
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
         }*/

        function InputHandler(callback) {
            this.inputArray = [];
            var self = this;

            document.onkeydown = function (event) {
                self.keyPressed(event);
            };
            document.onkeyup = function (event) {
                self.keyReleased(event);
            };

            //callback is function to call when new input came
            this.callback = callback;
        }

//event listener for press key
//add keycode to input array
        InputHandler.prototype.keyPressed = function (event) {
            //accepy only input code that is not in array already
            if (this.inputArray.indexOf(event.keyCode) == -1) {// && isInputValid(event.keyCode)) {
                this.inputArray.push(event.keyCode);
                this.callback(this.inputArray.slice());
            }
            // console.log('input: ' + event.keyCode);
        };

        InputHandler.prototype.keyReleased = function (event) {
            var index = this.inputArray.indexOf(event.keyCode);
            if (index > -1) {
                this.inputArray.splice(index, 1);
                this.callback(this.inputArray.slice());
            }
            //console.log('input: ' + this.inputArray);
        };

        InputHandler.prototype.clearInput = function () {
            this.inputArray.splice(0, this.inputArray.length);
            this.callback([]);
        };

        module.exports = InputHandler;
    }, {}]
}, {}, [1]);

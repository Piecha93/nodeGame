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


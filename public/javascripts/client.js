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



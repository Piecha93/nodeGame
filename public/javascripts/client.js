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

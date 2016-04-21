var socket = io.connect();
var Game = require('./logic/gamelogic');
var Render = require('./graphics/render');

//number of times per secound sending packets to server
var updateTickRate = 64;

var game = new Game();
var render = new Render();

var localId = -1;

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
    
    serverUpdateLoop();
});

//get update from server
socket.on('serverUpdate', function (data) {
    //console.log(data);
    updatePlayers(data.players);
});

//send update to server
function serverUpdateLoop() {
    if (game.players[localId] != undefined)
        socket.emit('clientUpdate', {input: game.players[localId].input});

    setTimeout(serverUpdateLoop, 1 / updateTickRate * 1000);
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



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

var localPlayer = null;
var socket = io.connect();

function assetsLoadedCallback() {
    socket.emit('connected');
}

socket.on('startgame', function (client) {
    //start game loop when connected to server
    game.startGameLoop();
    //set render to game logic update
    game.setRender(render);
    //create local player with id from server
    localPlayer = game.newPlayer(client.id);
    localPlayer.id = client.id;
    localPlayer.name = client.name;

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
                var m = messageBox.createMessage(message, localPlayer.name);
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
        if (localPlayer != null) {
            localPlayer.input = input;
            update.input = input;
            update.isEmpty = false;
        }
    }
}


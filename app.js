//set port (first for production server second to local
var port = process.env.PORT || 3000;
//sec to timeout when client lost connection
var timeOut = 10;

//set up node modules
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var UUID = require('node-uuid');
var GameServer = require('./gameserver');

server.listen(port);
console.log("Node server started on port: " + port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var routes = require('./routes/index');
app.use('/', routes);

//keep game servers references (game server is single "world" instance.)
var gameServers = {};
//keep all connected clients
var clients = [];
//to count guest nicknames
var names = 0;

//start one game instance
startNewServer();

//called when client start to loading page
io.sockets.on('connection', function (client) {
    client.id = -1;

    //called when client loaded assets and is reade to "real" connection
    client.on('connected', function () {
        clientConnected(client);
    });

    //called when client disconnected
    client.on('disconnect', function () {
        clientDisconnected(client);
    });

    //called when client sends update
    client.on('clientupdate', function (data) {
        handleClientUpdate(client, data);
    });

    //called when client sends message
    client.on('clientmessage', function (message) {
        handleClientMessage(client, message);
    });

    //called when client sends heartbeat
    client.on('heartbeat', function (data) {
        handleClientHeartbeat(client, data);
    });
});

function clientConnected(client) {
    client.id = UUID();
    client.serverId = selectServer();
    client.name = 'Guest' + names.toString();
    names++;

    clients.push(client);
    client.timeOutTime = timeOut;

    //send message to all ppl on server
    var message = {
        authorName: "server",
        addressee: "system",
        content: client.name + " connected"
    };
    gameServers[client.serverId].sendMessageToAll(message);

    //add client to server
    gameServers[client.serverId].clientConnected(client);
    client.emit('startgame', {id: client.id, name: client.name});
}

function clientDisconnected(client) {
    if (gameServers[client.serverId] != undefined) {
        if (client !== undefined) {
            gameServers[client.serverId].clientDisconnected(client);
        }
    }
}

function handleClientUpdate(client, data) {
    if (gameServers[client.serverId] != undefined) {
        if (data.input !== undefined) {
            gameServers[client.serverId].handleClientInput(client.id, data.input);
        }
        client.timeOutTime = timeOut;
    }
}

//send client message to proper clients or handle command
function handleClientMessage(client, message) {
    console.log(message.authorName + " - " + message.addressee + " : " + message.content);
    if (message !== null && message.content != "") {
        message.sendTime = new Date().getTime();
        if (message.addressee == "all") {
            gameServers[client.serverId].sendMessageToAll(message);
        } else if (message.addressee == "shout") {
            //TODO shout chat
        } else if (message.addressee == "trade") {
            //TODO trade chat
        } else if (message.addressee == "party") {
            //TODO party chat
        } else if (message.addressee == "command") {
            //TODO command system

            //if addressee is different then it must be whisper
        } else {
            var addresseeClient = null;
            //find client addressee
            for (var i = 0; i < clients.length; i++) {
                if (clients[i].name.toUpperCase() == message.addressee.toUpperCase() && clients[i].name.toUpperCase() != client.name.toUpperCase()) {
                    addresseeClient = clients[i];
                    //to keep original letters case
                    message.addressee = clients[i].name;
                    break;
                }
            }

            //if addressee found send him message. Author get the same message but swapped authorName and addressee for correct display.
            if (addresseeClient !== null) {
                addresseeClient.emit('servermessage', message);
                //swap addressee and authorName (magic xd)
                message.addressee = [message.authorName, message.authorName = "->" + message.addressee][0];
                client.emit('servermessage', message);
            }
            //if not found convert message to system info about failure
            else {
                message.content = "Player " + message.addressee + " is not online";
                message.addressee = "system";
                message.authorName = "system";
                client.emit('servermessage', message);
            }
        }
    }
}

function handleClientHeartbeat(client, data) {
    client.timeOutTime = timeOut;
    client.emit('heartbeatsresponse', {id: data.id})
}

function startNewServer() {
    var id = UUID();
    gameServers[id] = new GameServer(id);
    gameServers[id].startGameServer();
}

function selectServer() {
    return randomServer();
}

//Temp function. In future server would be chosen depends on other servers load
//TODO create server selection system
function randomServer() {
    var keys = Object.keys(gameServers);
    return keys[keys.length * Math.random() << 0];
}

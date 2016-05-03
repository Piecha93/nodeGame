//set up node modules
var port = process.env.PORT || 3000;
var timeOut = 10; //secounds to timeot when lost connection

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

var gameServers = {};
var clients = [];

startNewServer();

var names = "A";

io.sockets.on('connection', function (client) {
    client.id = -1;

    client.on('connected', function () {
        client.id = UUID();
        client.serverId = chooseServer();
        client.name = names;
        names = names + "A";

        clients.push(client);
        gameServers[client.serverId].clientConnected(client);

        client.timeOutTime = timeOut;

        client.emit('startgame', {id: client.id, name: client.name});
    });

    client.on('disconnect', function () {
        if (gameServers[client.serverId] != undefined) {
            if (client !== undefined) {
                gameServers[client.serverId].clientDisconnected(client);
            }
        }
    });

    client.on('clientupdate', function (data) {
        if (gameServers[client.serverId] != undefined) {
            if (data.input !== undefined) {
                gameServers[client.serverId].handleClientInput(client.id, data.input);
            }
            client.timeOutTime = timeOut;
        }
    });

    client.on('clientmessage', function (message) {
        if (message !== null && message.content != "") {
            message.sendTime = new Date().getTime();
            if (message.addressee == "all") {
                gameServers[client.serverId].handleClientMessage(message);
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
                    if (clients[i].name == message.addressee) {
                        addresseeClient = clients[i];
                        break;
                    }
                }

                //if addressee found send him message. Author get the same message or information about failure
                if (addresseeClient !== null) {
                    addresseeClient.emit('servermessage', message);
                    client.emit('servermessage', message);
                } else {
                    client.emit('servermessage', "Player " + message.addressee + " is not online");
                }
            }
        }
    });

    client.on('heartbeat', function (data) {
        client.timeOutTime = timeOut;
        client.emit('heartbeatsresponse', {id: data.id})
    });
});

function startNewServer() {
    var id = UUID();
    gameServers[id] = new GameServer(id);
    gameServers[id].startGameServer();
}

function chooseServer() {
    return randomServer();
}

//Temp function. In future server would be chosen depends on other servers load
function randomServer() {
    var keys = Object.keys(gameServers);
    return keys[keys.length * Math.random() << 0];
}

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

function startNewServer() {
    var id = UUID();
    gameServers[id] = new GameServer(id);
    gameServers[id].startGameServer();
}

startNewServer();

io.sockets.on('connection', function(client){
    client.id = -1;

    client.on('connected', function () {
        client.id = UUID();

        client.serverId = chooseServer();
        gameServers[client.serverId].clientConnected(client);

        client.timeOutTime = timeOut;

        client.emit('onconnected', {id: client.id});
    });

    client.on('disconnect', function () {
        gameServers[client.serverId].clientDisconnected(client);
    });

    client.on('clientUpdate', function (data) {
        if (data.input !== undefined) {
            gameServers[client.serverId].handleClientInput(client.id, data.input);
        }
        if (data.message != undefined) {
            //  messenger.pushMessage
        }
        client.timeOutTime = timeOut;
    });

    client.on('heartbeat', function (data) {
        client.timeOutTime = timeOut;
        client.emit('heartbeatsresponse', {id: data.id})
    });
});

function chooseServer() {
    return randomServer();
}

//Temp funciton. In future server would be choosen depends on other servers load
function randomServer() {
    var keys = Object.keys(gameServers);
    return keys[keys.length * Math.random() << 0];
}

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
var tmx = require('tmx-parser');

/*
 var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

 // Connection URL
 var url = 'mongodb://localhost:27017/local';
 // Use connect method to connect to the Server
 MongoClient.connect(url, function (err, db) {
 assert.equal(null, err);
 console.log("Connected correctly to server");

 db.close();
 });
 */

server.listen(port);
console.log("Node server started on port: " + port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var routes = require('./routes/index');
app.use('/', routes);

var GameInstance = require('./gameinstance');

//keep game servers references (game server is single "world" instance.)
var gameServers = {};
//keep all connected clients
var clients = {};
//to count guest nicknames
var names = 0;

//start one game instance
createNewInstance('mapatest');
createNewInstance('mapatest2');

//called when client start to loading page
io.sockets.on('connection', function (client) {
    client.name = 'Guest' + names.toString();
    names++;

    //called when client loaded assets and is ready to strat game
    client.on('ready', function () {
        clientReady(client);
    });

    //called when client disconnected
    client.on('disconnect', function () {
        clientLeft(client);
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

function clientReady(client) {
    client.serverId = selectServer();

    clients[client.name] = client;
    client.timeOutTime = timeOut;

    //send message to all ppl on server
    var message = {
        authorName: "server",
        addressee: "system",
        content: client.name + " connected"
    };

    gameServers[client.serverId].sendMessageToAll(message);

    //add client to server
    gameServers[client.serverId].clientReady(client);
    client.emit('startgame', {name: client.name, mapName: gameServers[client.serverId].mapName});
}

function clientLeft(client) {
    if (client !== undefined && gameServers[client.serverId] != undefined) {
        gameServers[client.serverId].clientLeft(client);
    }
}

function handleClientUpdate(client, data) {
    if (gameServers[client.serverId] != undefined) {
        if (data.input != null) {
            gameServers[client.serverId].handleClientInput(client.name, data.input);
        }
        if (data.angle != null) {
            gameServers[client.serverId].handleClientAngle(client.name, data.angle);
        }
        client.timeOutTime = timeOut;
    }
}

//send client message to proper clients or handle command
function handleClientMessage(client, message) {
    message.content = message.content.trim();
    console.log(message.authorName + " - " + message.addressee + " : " + message.content);
    //if message is to long send info client
    if (message.content.length > 250) {
        message.content = "Message to long. Max mesage length is 250";
        message.addressee = "system";
        message.authorName = "system";
        client.emit('servermessage', message);

        return;
    }
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
            for (var key in this.clients) {
                if (clients[key].name.toUpperCase() == message.addressee.toUpperCase() && clients[key].name.toUpperCase() != client.name.toUpperCase()) {
                    addresseeClient = clients[key];
                    //to keep original letters case
                    message.addressee = clients[key].name;
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

function portalEvent(clientName) {
    var client = clients[clientName];
    if (client !== undefined) {
        clientLeft(client);
        clientReady(client);
    }
}

function createNewInstance(mapName) {
    var id = UUID();
    var gameInstance = new GameInstance(id, mapName);
    gameInstance.startGameServer(portalEvent);
    gameServers[id] = gameInstance;
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

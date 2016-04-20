//set up node modules
var port = process.env.PORT || 3000;
var TIME_OUT_TIME = 10; //secounds to timeot when lost connection

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var UUID = require('node-uuid');

server.listen(port);
console.log("Server started on port: " + port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var routes = require('./routes/index');

app.use('/', routes);

var gameServer = require('./gameserver');

gameServer.startGameServer();

io.sockets.on('connection', function(client){

    client.id = UUID();

    client.emit('onconnected', { id :client.id });
    
    gameServer.clientConnected(client);
    client.timeOutTime = TIME_OUT_TIME;

    client.on('disconnect', function () {
        gameServer.clientDisconected(client);
    });

    client.on('clientUpdate', function (data) {
        gameServer.handleClientInput(client.id, data.input);
        client.timeOutTime = TIME_OUT_TIME;
    });
});


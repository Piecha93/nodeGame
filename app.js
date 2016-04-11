//set up node modules
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var UUID = require('node-uuid');

server.listen(3000);
console.log("Server started on port: 3000");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.set('view options', { locals: { scripts: ['jquery.js'] } });
app.use(express.static(__dirname + '/public'));

var routes = require('./routes/index');

app.use('/', routes);

var gameServer = require('./gameserver');

gameServer.startGameServer();

io.sockets.on('connection', function(client){

    client.id = UUID();

    client.emit('onconnected', { id :client.id });
    
    gameServer.clientConnected(client);

    client.on('send message', function(data){
        io.sockets.emit('New message', data);
    });

    client.on('disconnect', function () {
        gameServer.clientDisconected(client);
    })
});


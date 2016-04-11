var Game = require('./public/javascripts/gamelogic');

var game;

var tickrate = 64;
var clients = [];

//start server
function startGameServer() {
    
    game = new Game();
   // game.gameLoop();
    
    //start update loop
    updateLoop();
    console.log('Gameserver started');
}

//new client connected
function clientConnected(client) {
    clients.push(client);

    console.log('New client connected. id: ' + client.id);
    console.log('Clients connected(' + clients.length + '):');
    clients.forEach(function (c) {
        console.log(c.id);
    });
    game.newPlayer(client.id);
}

//client disconnected
function clientDisconected(client) {
    var indexToRemove = clients.indexOf(client);
    clients.splice(indexToRemove, 1)

    console.log('Client disconnected');
    console.log('Clients connected(' + clients.length + '):');
    clients.forEach(function (c) {
        console.log(c.id);
    });
    game.removePlayer(client.id);
}

//updateLoop all clients
function updateLoop() {
    var date =  new Date().getTime();
    clients.forEach(function (c) {
        c.emit('updateLoop', 'updatuje cie o czasie' + date)
    });
    
    setTimeout(updateLoop, 1/tickrate * 1000);
    //console.log('updating clients' + new Date().getTime());
};

module.exports.clientConnected = clientConnected;
module.exports.clientDisconected = clientDisconected;
module.exports.startGameServer = startGameServer;
var socket = io.connect();
var Game = require('./gamelogic');

var game = new Game();

//game.gameLoop();

socket.on('onconnected', function (data) {
    console.log('Connection to server succesfull. Your id is: ' + data.id);
});

socket.on('updateLoop', function (data) {
    console.log('Update from server: ' + data)
})



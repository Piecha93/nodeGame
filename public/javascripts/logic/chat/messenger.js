var Message = require("./message");

function Messenger() {
    this.messageArray = [];
}

//create and return message
Messenger.prototype.createMessage = function (content, authorName) {
    return new Message(content, authorName);
};

//create and add message to list
Messenger.prototype.addMessage = function (content, authorName) {
    var message = this.createMessage(content, authorName);
    this.messageArray.push(message);

    return message;
};

Messenger.prototype.pushMessages = function (messages) {
    this.messageArray.concat(messages);
    console.log('concat  ');
    console.log(this.messageArray);
};

//return x last messages
Messenger.prototype.getLast = function (count) {
    var arrayLength = this.messageArray.length;
    if (count > arrayLength) {
        count = arrayLength;
    }
    this.messageArray.slice(arrayLength - count, arrayLength);
};

module.exports = Messenger;
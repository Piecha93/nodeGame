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

Messenger.prototype.pushMessage = function (message) {
    this.messageArray.push(message);
    console.log(this.messageArray);
};

Messenger.prototype.pushMessages = function (messages) {
    this.messageArray.concat(messages);
    console.log('concat  ');
    console.log(this.messageArray);
};

Messenger.prototype.getLast = function (number) {
    var arrayLength = this.messageArray.length;
    if (number > arrayLength) {
        number = arrayLength;
    }
    this.messageArray.slice(arrayLength - number, arrayLength);
};

module.exports = Messenger;
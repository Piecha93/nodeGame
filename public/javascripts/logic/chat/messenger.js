var Message = require("./message");

function Messenger() {
    this.messageArray = [];
}

Messenger.prototype.addMessage = function (content, authorId, authorName) {
    this.messageArray.push(new Message(content, authorId, authorName));
};

Messenger.prototype.pushMessages = function (messages) {
    this.messageArray.concat(messages);
};

Messenger.prototype.getLast = function (number) {
    var arrayLength = this.messageArray.length;
    if (number > arrayLength) {
        number = arrayLength;
    }
    this.messageArray.slice(arrayLength - number, arrayLength);
};

module.exports = Messenger;
/*
 Class to keep all messages
 */

var Message = require("./message");

function MessageBox() {
    this.messageArray = [];
}

//create and return message
MessageBox.prototype.createMessage = function (content, authorName, addressee) {
    return new Message(content, authorName, addressee);
};

//create and add message to list
MessageBox.prototype.addMessage = function (content, authorName, addressee) {
    var message = this.createMessage(content, authorName, addressee);
    this.messageArray.push(message);

    return message;
};

MessageBox.prototype.pushMessages = function (messages) {
    this.messageArray.concat(messages);
    console.log('concat  ');
    console.log(this.messageArray);
};

//return x last messages
MessageBox.prototype.getLast = function (count) {
    var arrayLength = this.messageArray.length;
    if (count > arrayLength) {
        count = arrayLength;
    }
    return this.messageArray.slice(arrayLength - count, arrayLength);
};

module.exports = MessageBox;
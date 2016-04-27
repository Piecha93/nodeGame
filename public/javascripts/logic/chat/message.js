function Message(content, authorName) {
    this.content = content;
    this.authorName = authorName;
    this.sendTime = -1;
}

Message.prototype.append = function (content) {
    this.content = this.content + connect;
};

Message.prototype.setContent = function (content) {
    this.content = content;
};

module.exports = Message;
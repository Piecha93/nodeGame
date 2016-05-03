function Message(content, authorName) {
    this.content = content;
    this.authorName = authorName;
    this.sendTime = -1;
}

Message.prototype.append = function (content) {
    this.content = this.content + content;
};

Message.prototype.setContent = function (content) {
    this.content = content;
};

Message.prototype.parseAddressee = function () {
    var firstChar = this.content.charAt(0);
    if (firstChar == '!') {
        this.addressee = "shout";
    } else if (firstChar == '$') {
        this.addressee = "trade";
    } else if (firstChar == '#') {
        this.addressee = "party";
    } else if (firstChar == '"') {
        this.addressee = this.content.substr(1, this.content.indexOf(" ") - 1);
    } else if (firstChar == '/') {
        this.addressee = "command";
    } else {
        this.addressee = "all";
    }

    if (this.addressee != "all") {
        this.content = this.content.substr(1, this.content.length);
    }
    return this.addressee;
};

module.exports = Message;


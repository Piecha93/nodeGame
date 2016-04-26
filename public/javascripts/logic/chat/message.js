function Message(content, authorId, authorName, sendTime) {
    this.content = content;
    this.authorId = authorId;
    this.authorName = authorName;
    this.sendTime = sendTime;
}

module.exports = Message;
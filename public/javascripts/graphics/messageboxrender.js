function MessageInputRender(messageBox) {
    this.messageBox = messageBox;
    this.textGroup = null;

    this.colors = {
        all: 0xffffff,
        shout: 0xC65B08,
        whisper: 0x7A378B,
        system: 0xFF0000
    }
}

MessageInputRender.prototype.init = function (textGroup) {
    this.textGroup = textGroup;
};

MessageInputRender.prototype.update = function () {
    var messages = this.messageBox.getLast(10);

    for (var i = 0; i < messages.length; i++) {
        var textHolder = this.textGroup.children[messages.length - i - 1];
        textHolder.text = messages[i].authorName + ': ' + messages[i].content;
        switch (messages[i].addressee) {
            case 'all':
                textHolder.fill = hexToString(this.colors.all);
                break;
            case 'system':
                textHolder.fill = hexToString(this.colors.system);
                break;
            default:
                //for whisper
                textHolder.text = messages[i].addressee + ': ' + messages[i].content;
                textHolder.fill = hexToString(this.colors.whisper);
                break;
        }
    }

};

function hexToString(hex) {
    return '#' + hex.toString(16);
}

module.exports = MessageInputRender;
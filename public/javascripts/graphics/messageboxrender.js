/*
 Rendering messages
 TODO scrollbar, resize, hide, drag able
 */

function MessageBoxRender(game, messageBox) {
    this.game = game;
    this.messageBox = messageBox;
    this.textGroup = null;

    this.colors = {
        all: 0xffffff,
        shout: 0xC65B08,
        whisper: 0x7A378B,
        system: 0xFF0000
    }
}

MessageBoxRender.prototype.init = function () {
    this.textGroup = this.game.add.group();
    for (var i = 0; i < 10; i++) {
        this.textGroup.add(this.game.add.text(0, this.game.height - i * 16 - 50, "", {
            font: "14px Courier"
        }));
    }
};

MessageBoxRender.prototype.update = function () {
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
                textHolder.fill = hexToString(this.colors.whisper);
                break;
        }
    }

};

MessageBoxRender.prototype.destroy = function () {
    this.textGroup.destroy(true, false);
}

function hexToString(hex) {
    return '#' + hex.toString(16);
}

module.exports = MessageBoxRender;
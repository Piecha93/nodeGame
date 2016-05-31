/*
 Rendering messages
 TODO scrollbar, resize, hide, drag able
 */

function MessageBoxRender(game, group, messageBox) {
    this.game = game;
    this.group = group;
    this.messageBox = messageBox;
    this.textHolder = null;

    //size of message box
    this.heigth = 400;
    this.width = 300;


    this.colors = {
        all: 0xffffff,
        shout: 0xC65B08,
        whisper: 0x7A378B,
        system: 0xFF0000
    }
}

MessageBoxRender.prototype.init = function () {
    this.textHolder = this.game.add.text(0, 0, "", {
        font: "13px Courier",
        wordWrap: true,
        wordWrapWidth: this.width
    });

    this.group.add(this.textHolder);
    this.textHolder.fixedToCamera = true;
};

MessageBoxRender.prototype.update = function () {
    var messages = this.messageBox.getLast(10);

    this.textHolder.text = "";
    this.textHolder.clearColors();
    for (var i = 0; i < messages.length; i++) {
        var startColorIndex = this.textHolder.text.length;
        //TODO wrap to long single words
        this.textHolder.text += "\n" + messages[i].authorName + ': ' + messages[i].content;
        switch (messages[i].addressee) {
            case 'all':
                this.textHolder.addColor(hexToString(this.colors.all), startColorIndex);
                break;
            case 'system':
                this.textHolder.addColor(hexToString(this.colors.system), startColorIndex);
                break;
            default:
                //for whisper
                this.textHolder.addColor(hexToString(this.colors.whisper), startColorIndex);
                break;
        }
        if (this.textHolder.height > this.heigth)
            return;
    }

    this.textHolder.cameraOffset.y = this.game.height - this.textHolder.height - 50;
};

MessageBoxRender.prototype.destroy = function () {
    this.textHolder.destroy(true, false);
    this.textHolder = null;
    this.messageBox = null;
    this.game = null;
    this.group = null;
};

function hexToString(hex) {
    return '#' + hex.toString(16);
}

module.exports = MessageBoxRender;
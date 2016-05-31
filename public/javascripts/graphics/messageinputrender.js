/*
 render text area for chat input
 using CanvasInput library
 */
function MessageInputRender(game, group) {
    this.game = game;
    this.group = group;
    this.inputSprite = null;
    this.bitmap = null;
}

MessageInputRender.prototype.init = function () {
    this.bitmap = this.game.add.bitmapData(250, 40);
    this.inputSprite = this.game.add.sprite(0, this.game.height - 35, this.bitmap);
    this.inputSprite.fixedToCamera = true;
    this.group.add(this.inputSprite);

    this.inputSprite.canvasInput = new CanvasInput({
        canvas: this.bitmap.canvas,
        fontSize: 14,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 200,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 3,
        boxShadow: '1px 1px 0px #fff',
        innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
        placeHolder: 'Press enter to write...'
    });
};

MessageInputRender.prototype.update = function () {
};

MessageInputRender.prototype.startTyping = function () {
    this.inputSprite.canvasInput.focus();
};

MessageInputRender.prototype.getTextAndReset = function () {
    var text = this.inputSprite.canvasInput.value();

    this.inputSprite.canvasInput.blur();
    this.inputSprite.canvasInput.value("");

    return text;
};

MessageInputRender.prototype.destroy = function () {
    if (this.inputSprite != null) {
        if (this.inputSprite.canvasInput != null) {
            this.inputSprite.canvasInput.destroy();
            this.inputSprite.canvasInput = null;
        }
        this.inputSprite.destroy();
        this.inputSprite = null;
    }
    if (this.bitmap != null) {
        this.bitmap.destroy();
        this.bitmap = null;
    }
    this.game = null;
    this.group = null;
};

module.exports = MessageInputRender;
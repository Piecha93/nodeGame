function MessengerRender() {
    this.messenger = null;
}

MessengerRender.prototype.init = function (inputSprite, canvas) {
    this.inputSprite = inputSprite;
    this.inputSprite.canvasInput = new CanvasInput({
        canvas: canvas,
        fontSize: 14,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 400,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 3,
        boxShadow: '1px 1px 0px #fff',
        innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
        placeHolder: 'Enter message here...'
    });

    this.inputSprite.canvasInput.focus();
};

MessengerRender.prototype.update = function () {

};

MessengerRender.prototype.getTextAndDestroy = function () {
    var text = this.inputSprite.canvasInput.value();
    this.inputSprite.canvasInput.destroy();
    this.inputSprite.destroy();

    return text;
};

module.exports = MessengerRender;
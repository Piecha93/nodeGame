function InputHandler() {
    this.inputArray = [];
    var self = this;
    document.onkeydown = function (event) {
        self.keyPressed(event);
    };
};

InputHandler.prototype.keyPressed = function (event) {
    this.inputArray.push(event.keyCode);
    console.log('input: ' + this.inputArray);
};

module.exports = InputHandler;
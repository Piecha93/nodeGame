function InputHandler() {
    this.inputArray = [];
    var self = this;
    document.onkeydown = function (event) {
        self.keyPressed(event);
    };
};


InputHandler.prototype.keyPressed = function (event) {
    // if(event.keyCode == 37)
    this.inputArray.push(event.keyCode);
    console.log('input: ' + this.inputArray);
};

module.exports = InputHandler;
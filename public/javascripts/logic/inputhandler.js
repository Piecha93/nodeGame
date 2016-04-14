function InputHandler() {
    this.inputArray = [];
    var self = this;
    document.onkeydown = function (event) {
        self.keyPressed(event);
    };
};

InputHandler.prototype.keyPressed = function (event) {
    //dont put duplicate input
    if (this.inputArray.indexOf(event.keyCode) == -1)
        this.inputArray.push(event.keyCode);
    
    console.log('input: ' + this.inputArray);
};

InputHandler.prototype.getInput = function () {
    var inputCopy = this.inputArray.slice();
    this.inputArray = [];
    return inputCopy;
}

module.exports = InputHandler;
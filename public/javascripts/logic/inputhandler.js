function InputHandler() {
    this.inputArray = [];
    var self = this;
    //if document if undefined we are on server and dont need read keys
    if (typeof document !== 'undefined') {
        document.onkeydown = function (event) {
            self.keyPressed(event);
        };
        document.onkeyup = function (event) {
            self.keyReleased(event);
        }
    }
};

//event listener for press key
//add keycode to input array
InputHandler.prototype.keyPressed = function (event) {
    //accepy only input code that is not in array already
    if (this.inputArray.indexOf(event.keyCode) == -1)
        this.inputArray.push(event.keyCode);
    
    console.log('input: ' + this.inputArray);
};

InputHandler.prototype.keyReleased = function (event) {
    var index = this.inputArray.indexOf(event.keyCode);
    if (index > -1) {
        this.inputArray.splice(index, 1);
    }
    console.log('input: ' + this.inputArray);
};

InputHandler.prototype.handleClientInput = function () {
    return this.inputArray;
};

module.exports = InputHandler;
function InputHandler() {
    this.inputArray = [];
    var self = this;
    this.isServer = true;
    //if document if undefined we are on server and dont need read keys
    if (typeof document !== 'undefined') {
        this.isServer = false;
        document.onkeydown = function (event) {
            self.keyPressed(event);
        };
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

InputHandler.prototype.handleClientInput = function () {
    if (!this.isServer) {
        var inputCopy = this.inputArray.slice();
        this.inputArray = [];
        return inputCopy;
    }
    return [];
};

module.exports = InputHandler;
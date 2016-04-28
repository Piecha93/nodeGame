var validInputs = [
    39, 68, //right
    37, 65, //left
    38, 83, //up
    40, 87  //down
];

function isInputValid(inputCode) {
    if (validInputs.indexOf(inputCode) != -1) {
        return true;
    }
    return false;
}

function InputHandler(callback) {
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

    //callback is function to call when new input came
    this.callback = callback;
};

//event listener for press key
//add keycode to input array
InputHandler.prototype.keyPressed = function (event) {
    //accepy only input code that is not in array already
    if (this.inputArray.indexOf(event.keyCode) == -1) {// && isInputValid(event.keyCode)) {
        this.inputArray.push(event.keyCode);
        this.callback(this.inputArray);
    }
    // console.log('input: ' + event.keyCode);
};

InputHandler.prototype.keyReleased = function (event) {
    var index = this.inputArray.indexOf(event.keyCode);
    if (index > -1) {
        this.inputArray.splice(index, 1);
        this.callback(this.inputArray);
    }
    //console.log('input: ' + this.inputArray);
};

InputHandler.prototype.clearInput = function () {
    this.inputArray.splice(0, this.inputArray.length);
    this.callback(this.inputArray);
};

module.exports = InputHandler;
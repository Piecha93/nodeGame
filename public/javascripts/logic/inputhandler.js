/*var validInputs = [
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
 }*/

function InputHandler() {
    this.inputArray = [];
    var self = this;

    document.onkeydown = function (event) {
        self.keyPressed(event);
    };
    document.onkeyup = function (event) {
        self.keyReleased(event);
    };

    //set callback to empty function
    this.deleteCallback();
}

InputHandler.prototype.setCallback = function (callback) {
    this.callback = callback;
};

InputHandler.prototype.deleteCallback = function () {
    this.callback = function () {

    }
};

//event listener for press key
//add keycode to input array
InputHandler.prototype.keyPressed = function (event) {
    //accepy only input code that is not in array already
    if (this.inputArray.indexOf(event.keyCode) == -1) {// && isInputValid(event.keyCode)) {
        this.inputArray.push(event.keyCode);
        this.callback(this.inputArray.slice());
    }
    // console.log('input: ' + event.keyCode);
};

InputHandler.prototype.keyReleased = function (event) {
    var index = this.inputArray.indexOf(event.keyCode);
    if (index > -1) {
        this.inputArray.splice(index, 1);
        this.callback(this.inputArray.slice());
    }
    //console.log('input: ' + this.inputArray);
};

InputHandler.prototype.clearInput = function () {
    this.inputArray.splice(0, this.inputArray.length);
    this.callback([]);
};

module.exports = InputHandler;
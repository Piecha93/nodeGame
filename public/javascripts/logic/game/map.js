var tmx = require('tmx-parser');
var p2 = require('p2');

function Map(name, physicsWorld) {
    this.mapData = null;
    this.collisionLayer = null;
    this.name = name;
    this.physicsWorld = physicsWorld;

    var self = this;
    tmx.parseFile(mapsPath + '/' + name + '.tmx', function (err, map) {
        if (err) throw err;
        self.mapData = map;
        self.setCollisionBlocks();
    });
}

/*
 function breate physics body on blocks from 2 and 3 layer of the map
 */
Map.prototype.setCollisionBlocks = function () {
    for (var i = 0; i < this.mapData.width; i++) {
        for (var j = 0; j < this.mapData.height; j++) {
            if (this.mapData.layers[1].tileAt(i, j) !== undefined
                || this.mapData.layers[2].tileAt(i, j) !== undefined) {
                var shape = new p2.Box({
                    width: 32,
                    height: 32
                });

                var body = new p2.Body({
                    //position of block (+16 because it is center of block)
                    position: [i * 32 + 16, j * 32 + 16],
                    mass: 0
                });

                body.addShape(shape);
                this.physicsWorld.addBody(body);
            }
        }
    }
};

var mapsPath;
if (typeof window === 'undefined') {
    mapsPath = './public/resources/maps';
} else {
    //if we are in browser we need to overload readFile function
    mapsPath = './resources/maps';
    tmx.readFile = function (path, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = onReadyStateChange;
        request.open("GET", path, true);
        try {
            request.send();
        } catch (err) {
            callback(err);
        }
        function onReadyStateChange() {
            if (request.readyState !== 4) return;
            if (Math.floor(request.status / 100) === 2) {
                callback(null, request.responseText);
                return;
            }
            callback(new Error(request.status + ": " + request.statusText));
        }
    };
}


module.exports = Map;
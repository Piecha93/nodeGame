var tmx = require('tmx-parser');
var p2 = require('p2');

function Map(name, physicsWorld) {
    this.mapData = null;
    this.name = name;
    this.physicsWorld = physicsWorld;
    this.mapBlocks = [];
    this.portalSensors = [];

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
    var w = 32;
    var h = 32;

    //check for collision blocks
    for (var i = 0; i < this.mapData.width; i++) {
        for (var j = 0; j < this.mapData.height; j++) {
            if (this.mapData.layers[1].tileAt(i, j) !== undefined
                || this.mapData.layers[2].tileAt(i, j) !== undefined) {
                var body = createBody(i * w + w / 2, j * h + h / 2, w, h, false);
                this.physicsWorld.addBody(body);
                this.mapBlocks.push(body);
            }
        }
    }

    //check for portals (only border of screen)
    for (i = 0; i < this.mapData.width; i++) {
        for (j = 0; j < this.mapData.height; j++) {
            var tile = this.mapData.layers[3].tileAt(i, j);
            if (tile !== undefined && tile.id == 418) {
                var body = createBody(i * w + w / 2, j * h + h / 2, w, h, true);
                this.physicsWorld.addBody(body);
                this.portalSensors.push(body);
            }
        }
    }
};

Map.prototype.destroy = function () {
    var self = this;
    this.mapBlocks.forEach(function (block) {
        self.physicsWorld.removeBody(block);
    });
    this.portalSensors.forEach(function (sensor) {
        self.physicsWorld.removeBody(sensor);
    });
    this.mapData = null;
};

function createBody(x, y, w, h, isSensor) {
    var shape = new p2.Box({
        width: w,
        height: h
    });

    if (isSensor == true) {
        shape.sensor = true;
    }

    var body = new p2.Body({
        //position of block (+16 because it is center of block)
        position: [x, y],
        mass: 0
    });

    body.addShape(shape);

    return body;
}

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
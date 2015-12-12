
function Plant(seed) {
    this.seed = seed;

    this.root = new Stem(seed.x, seed.y, Math.PI/2);
    this.growthStem = this.root;

    this.energy = 100;
    this.newStemTimer = 4;

    this.image = game.add.bitmapData(1600, 2400);
    this.image.addToWorld();
}

Plant.prototype.strengthen = function() {
    //make stems thicker - spends energy
}

Plant.prototype.grow = function() {
    //lengthen stem
    this.energy -= this.growthStem.grow();
    if (--this.newStemTimer < 0) {
        this.newStemTimer = Math.floor(Math.random()*3+2);

        leaf = this.growthStem.getLeaf();
        //console.log(leaf);
        var newStem = new Stem(leaf[0], leaf[1], this.growthStem.growDirection);
        this.growthStem.locked = true;
        var spot = this.growthStem.getSpot();
        this.growthStem.addStem(newStem, spot, Math.round(Math.random())*2-1);
        this.growthStem = newStem;
    }
}

Plant.prototype.getNextLeafStem = function() {

}

Plant.prototype.render = function(full) {
    if (full === true) {
        this.image.clear();
    }
    //draw all locked stems fully
    //draw the growing stems gradually

    this.root.drawOn(this.image, full);
}





// Stems

// A stem can have N children, which extrude from the stem at any index of the path array.

function Stem(x, y, dir) {
    this.parts = { "x" : [x], "y" : [y] };
    this.growDirection = dir;

    this.strength = 10; // Basically the width of the stem

    this.children = { };
    this.parent = null;

    this.locked = false;

    this.texture = "trunkspr";

    this.sprite = game.make.sprite(0, 0, "trunkspr");
    this.sprite.anchor.set(0.5);

    this.path = [];
}

Stem.prototype.strengthen = function(add) {
    this.strength += add;
    return add;
}

Stem.prototype.grow = function() {
    //only for stems that have no children

    var cur = this.getLeaf();
    var growthLength = Math.floor(Math.random()*40 + 20);

    cur[0] += Math.cos(this.growDirection) * growthLength;
    cur[1] -= Math.sin(this.growDirection) * growthLength;

    this.parts.x.push(cur[0]);
    this.parts.y.push(cur[1]);

    //calculte the points path again
    this.path = [];

    var x = 1 / 5; //resolution of the interpolation
    for (var i = 0; i <= 1; i+= x) { //modify the limit to adjust the length of the stem on screen
        var px = game.math.bezierInterpolation(this.parts.x, i);
        var py = game.math.bezierInterpolation(this.parts.y, i);

        this.path.push( { x: px, y: py });
    }

    return 1;
}

Stem.prototype.drawOn = function(bmd, fullrender) {
    //draw the stem to the given bitmapdata
    if (fullrender || !this.locked) {
        for (var i = 0; i < this.path.length - 1; i++) {
            var x = this.path[i].x;
            var y = this.path[i].y;
            var x2 = this.path[i+1].x;
            var y2 = this.path[i+1].y;
            var line = new Phaser.Line(x, y, x2, y2)
            bmd.textureLine(line, this.texture, "repeat");
        }
    }

    //recursion to children too
    for (var key in this.children) {
        if (this.children.hasOwnProperty(key)) {
            this.children[key].drawOn(bmd, fullrender);
        }
    }
}

Stem.prototype.addStem = function(stem, index, side) {
    this.children[index] = stem; //add value to the hash table / object
    stem.parent = this;

    stem.growDirection += side * 0.25;
}

Stem.prototype.getBase = function() {
    return [this.parts.x[0], this.parts.y[0]];
}

Stem.prototype.getLeaf = function() {
    return [this.parts.x[this.parts.x.length - 1], this.parts.y[this.parts.y.length - 1]];
}

Stem.prototype.getSpot = function() {
    var l = this.path.length / parseFloat(3);
    return Math.floor(Math.random()*l + l);
}

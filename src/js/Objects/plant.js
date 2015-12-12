
function Plant(seed) {
    this.seed = seed;

    this.root = new Stem(seed.x, seed.y, Math.PI/2);
    this.growthStem = this.root;

    this.energy = 100;
    this.newStemTimer = 15;

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
        this.newStemTimer = this.getNextStemLength();

        var spot = this.growthStem.getCoords(this.growthStem.getSpot());
        var newStem = new Stem(spot[0], spot[1], this.growthStem.growDirection);
        this.growthStem.locked = true;
        this.growthStem.addStem(newStem, spot, Math.round(Math.random())*2-1);
        this.growthStem = newStem;
    }
}

Plant.prototype.getNextStemLength = function() {
    return 15; //TODO
}

Plant.prototype.render = function(full) {
    if (full === true) {
        this.image.clear();
    }
    //draw all locked stems fully
    //draw the growing stems gradually

    this.root.drawOn(this.image, full);

    this.growthStem.drawGrowing(this.image);
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

    this.texture = new Image(game, 0, 0, "trunkspr");
    this.texture.scale = 0.2;

    this.sprite = game.make.sprite(0, 0, "trunkspr");
    this.sprite.anchor.set(0.5);

    this.path = [];

    this.growthDrawIndex = {"index" : 0};

    this.currentTween = null;
    this.tweenTarget = 0;
}

Stem.prototype.strengthen = function(add) {
    this.strength += add;
    return add;
}

Stem.prototype.grow = function() {
    //only for stems that have no children

    var oldPathLength = this.path.length;

    var cur = this.getLeaf();
    var growthLength = Math.floor(Math.random()*30 + 20);

    cur[0] += Math.cos(this.growDirection) * growthLength;
    cur[1] -= Math.sin(this.growDirection) * growthLength;

    this.parts.x.push(cur[0]);
    this.parts.y.push(cur[1]);

    //calculate the path again
    this.path = [];

    var x = 1 / 50; //resolution of the interpolation
    for (var i = 0; i <= 1; i+= x) { //modify the limit to adjust the length of the stem on screen
        var px = game.math.bezierInterpolation(this.parts.x, i);
        var py = game.math.bezierInterpolation(this.parts.y, i);

        this.path.push( { x: px, y: py });
    }

    this.strength -= 0.5;

    // set tweening of the draw index

    if (this.currentTween === null) {
        console.log("new");
        this.tweenTarget = this.path.length - 1;
        this.currentTween = game.add.tween(this.growthDrawIndex).to( { index : 26 }, 1500, Phaser.Easing.Linear.InOut, false);
        this.currentTween.start();
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
            //var line = new Phaser.Line(x, y, x2, y2)
            //bmd.textureLine(line, this.texture, "repeat");
            //bmd.draw(this.sprite, x, y, this.strength, this.strength);
            //bmd.circle(x, y, 20, "#00ff00");
        }
    }
    //bmd.draw(this.sprite, -100, -100); //without this bmd.circle doesnt work :D

    for (var i = 0; i < this.growthDrawIndex.index; i++) {
        var x = this.path[i].x;
        var y = this.path[i].y;
        var x2 = this.path[i+1].x;
        var y2 = this.path[i+1].y;
        bmd.draw(this.sprite, x, y, this.strength, this.strength);
    }

    for (var i = 0; i < this.parts.x.length; i++) {
        var x = this.parts.x[i];
        var y = this.parts.y[i];
        bmd.circle(x, y, 5, "rgb(255,0,0)");
    }

    //recursion to children too
    for (var key in this.children) {
        if (this.children.hasOwnProperty(key)) {
            this.children[key].drawOn(bmd, fullrender);
        }
    }
}

Stem.prototype.drawGrowing = function() {

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

Stem.prototype.getCoords = function(spot) {
    return [this.path[spot].x, this.path[spot].y];
}
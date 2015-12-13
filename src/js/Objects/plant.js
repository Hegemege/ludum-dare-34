
function Plant(seed) {
    this.seed = seed;

    this.root = new Stem(seed.x, seed.y, Math.PI/2);
    this.growthStem = this.root;

    this.energy = 100;
    this.newStemTimer = 12;

    this.image = game.add.bitmapData(1600, 2400);
    this.image.addToWorld();
}

Plant.prototype.strengthen = function() {
    //make stems thicker - spends energy
}

Plant.prototype.grow = function(cost) {
    //lengthen current growing stem
    this.energy -= this.growthStem.grow(this.image);
}

Plant.prototype.newStem = function(oldstem, position) {
    var spot = oldstem.getRandomSpot();
    var coords = oldstem.getCoords(spot);
    var newStem = new Stem(coords[0], coords[1], oldstem.getDirAt(spot));
    oldstem.addStem(newStem, spot, Math.round(Math.random())*2-1);
    oldstem = newStem;
}

Plant.prototype.getNextStemLength = function() {
    return 15; //TODO
}

Plant.prototype.render = function(full) {
    //draw all locked stems fully
    //draw the growing stems gradually

    this.growthStem.drawOn(this.image, full);
}

Plant.prototype.getSurfaced = function(height) {
    var leaf = this.growthStem.getLeaf();
    if (leaf[1] < height) {
        return true;
    }
    return false;
}

Plant.prototype.stopGrowing = function() {
    this.growthStem.currentTween.onComplete.add(function() {
        this.growing = false;
        this.growthStem.doneDrawing = true;
    }, this);
}





// Stems

// A stem can have N children, which extrude from the stem at any index of the path array.

function Stem(x, y, dir) {
    this.parts = { "x" : [x], "y" : [y] };
    this.growDirection = dir;

    this.strength = 10; // Basically the width of the stem
    this.thinning = 0.35;

    this.children = { };
    this.parent = null;

    this.texture = new Image(game, 0, 0, "trunkspr");
    this.texture.scale = 0.2;

    this.sprite = game.make.sprite(0, 0, "trunkspr");
    this.sprite.anchor.set(0.5);

    this.path = [];
    this.strengths = [];
    this.dirs = [];

    this.growthDrawIndex = {"index" : 0};

    this.currentTween = null;
    this.tweenTarget = 0;

    this.growing = true;
    this.doneDrawing = false;
}

Stem.prototype.strengthen = function(add) {
    this.strength += add;
    return add;
}

Stem.prototype.grow = function(bmd) {
    //bmd.clear();

    //only for stems that have no children

    var cur = this.getLeaf();
    var growthLength = 40;//Math.floor(Math.random()*30 + 20);

    cur[0] += Math.cos(this.growDirection) * growthLength;
    cur[1] -= Math.sin(this.growDirection) * growthLength;

    this.parts.x.push(cur[0]);
    this.parts.y.push(cur[1]);

    var oldPathLength = this.path.length;

    //calculate the path again
    this.path = [];

    var x = 1 / parseFloat(10*this.parts.x.length); //resolution of the interpolation
    for (var i = 0; i <= 1; i+= x) { //modify the limit to adjust the length of the stem on screen
        var px = game.math.catmullRomInterpolation(this.parts.x, i);
        var py = game.math.catmullRomInterpolation(this.parts.y, i);

        this.path.push( { x: px, y: py });
    }

    this.strength -= this.thinning;

    //Store strength for each path point

    for (var i = oldPathLength; i < this.path.length; i++) { //worked first time yay
        this.strengths.push(this.strength);
        this.dirs.push(this.growDirection);
    }

    // set tweening of the draw index
    this.tweenTarget = this.path.length;
    var newTween = game.add.tween(this.growthDrawIndex).to( { index : this.tweenTarget }, 1000, Phaser.Easing.Linear.InOut, false);
    if (this.currentTween === null || !this.currentTween.isRunning) {
        this.currentTween = newTween;
        this.currentTween.start();
    } else {
        this.currentTween.chain(newTween);
    }


    return 1;
}

Stem.prototype.drawOn = function(bmd, fullrender) {
    //draw the stem to the given bitmapdata
    /*if (fullrender || !this.locked) {
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
    }*/
    if (fullrender || this.growing) {
        //bmd.draw(this.sprite, -100, -100); //without this bmd.circle doesnt work :D
        for (var i = 0; i < this.growthDrawIndex.index; i++) {
            var x = this.path[i].x;
            var y = this.path[i].y;
            bmd.draw(this.sprite, x, y, this.strengths[i], this.strengths[i]);
        }
    }

/*
    for (var i = 0; i < this.parts.x.length; i++) {
        var x = this.parts.x[i];
        var y = this.parts.y[i];
        bmd.circle(x, y, 5, "rgb(255,0,0)");
    }*/

    if (fullrender) {
        //recursion to children too
        for (var key in this.children) {
            if (this.children.hasOwnProperty(key)) {
                this.children[key].drawOn(bmd, fullrender);
            }
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

Stem.prototype.getLeafPart = function() {
    return [this.parts.x[this.parts.x.length - 1], this.parts.y[this.parts.y.length - 1]];
    //if (this.path.length > 0)
    //    return [this.path[this.path.length - 1].x, this.path[this.path.length - 1].y];
    //return [this.parts.x[0], this.parts.y[0]];
}

Stem.prototype.getLeaf = function() {
    if (this.path.length > 0)
        return [this.path[this.path.length - 1].x, this.path[this.path.length - 1].y];
    return [this.parts.x[this.parts.x.length - 1], this.parts.y[this.parts.y.length - 1]];
}

Stem.prototype.getRandomSpot = function() {
    var l = this.path.length / parseFloat(3);
    return Math.floor(Math.random()*l + l);
}

Stem.prototype.getLeafSpot = function() {
    return this.path.length - 1;
}

Stem.prototype.getCoords = function(spot) {
    return [this.path[spot].x, this.path[spot].y];
}

Stem.prototype.getDirAt = function(spot) {
    return this.dirs[spot];
}
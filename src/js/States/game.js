var Game = function () {};

var cursors;

Game.prototype = {

    init: function () {

    },

    preload: function () {

    }, 

    create: function() {
        // Background
        this.bg = game.add.sprite(0, 0, "gamebg");

        // Sprites
        this.seed = game.add.sprite(800, 1800, "seedspr");
        this.seed.anchor.x = 0.5;
        this.seed.anchor.y = 0.5;

        // Resize world
        game.world.resize(1600, 2400);
        game.world.setBounds(0, 0, 1600, 2400);

        game.camera.deadzone = new Phaser.Rectangle(100, 100, 600, 400);

        this.cameraFocusPoint = game.add.sprite(0, 0, "blobspr");
        this.cameraFocusPoint.visible = false;

        // Set up game variables
        this.surfaceHeight = 1210;
        this.groundline = game.add.graphics(0,0);
        this.groundline.lineStyle(4, 0x2E421A, 0.3);
        this.groundline.moveTo(0, this.surfaceHeight);
        this.groundline.lineTo(1600, this.surfaceHeight);

        this.plant = new Plant({"x" : 800, "y" : 1800});

        this.leaves = [];

        this.brokeSurface = false;
        this.surfaceBaseStem = null;
        this.surfaceBaseSpot = null;

        // Set up timed events
        game.time.events.add(Phaser.Timer.SECOND, this.startCrawling, this);

        this.gameState = 1; // 1 crawling to surface
                            // 2 gathering energy
                            // 3 waiting for user input
                            // 4 growing

        this.traverse = false;
        this.traverseTrackCoords = null;

        this.waitInputTimer = null;
        this.allowInput = true;

        // gameplay

        this.leafChance = 0;
        this.leafBaseChance = 0.4;

        this.strengthenAmount = 1;
        this.strengthenBaseAmount = 1;

        this.waterSprite = game.add.sprite(-500, -500, "waterspr");
        this.waterSprite.anchor.x = 0.5;
        this.waterSprite.anchor.x = 0.5;
        this.waterSprite.scale.set(0.5);

        this.waterBounds = [300, 400, 900, 1000];

        this.waterWait = false;

        // DEBUG
        cursors = game.input.keyboard.createCursorKeys();

        var focuspoint = this.plant.growthStem.getBase();

        this.cameraFocusPoint.x = focuspoint[0];
        this.cameraFocusPoint.y = focuspoint[1];

        game.camera.follow(this.cameraFocusPoint);

        this.seed.bringToTop();
    },

    update: function() {
        // Input
        /*if (cursors.up.isDown) {
            game.camera.y -= 4;
        } else if (cursors.down.isDown) {
            game.camera.y += 4;
        }
        if (cursors.left.isDown) {
            game.camera.x -= 4;
        } else if (cursors.right.isDown) {
            game.camera.x += 4;
        }*/
        if (this.plant.growing) {
            if (cursors.left.isDown) {
                this.plant.growthStem.growDirection += 0.01;
            } else if (cursors.right.isDown) {
                this.plant.growthStem.growDirection -= 0.01;
            }
        }

        if (this.traverse) {
            var output = this.plant.traverse();
            if (output == -1) {
                this.stopTraverse(true);
                this.startGrowing();
            } else {
                this.traverseTrackCoords = this.plant.getTraverseCoords();
            }
            if (this.allowInput) {
                if (cursors.left.isDown || cursors.right.isDown) {
                    //see if a stem is near this point: jump to that
                    //else, start new stem
                    this.allowInput = false;
                    this.waitInputTimer = game.time.events.add(Phaser.Timer.SECOND/2, function() {this.allowInput = true;}, this);
                    this.tryGrowStem(cursors.left.isDown);
                }
            }

        }

        var tip = this.getTip();
        var dx = tip[0] - this.waterSprite.x;
        var dy = tip[1] - this.waterSprite.y;
        var tipdist = Math.sqrt(dx*dx + dy*dy);
        if (tipdist < 24 && !this.waterWait) {
            this.waterWait = true;
            this.waitInputTimer = game.time.events.add(Phaser.Timer.SECOND/2, function() {this.waterWait = false;}, this);
            this.relocateWater(true);
        }

    },

    render: function() {
        //game.debug.cameraInfo(game.camera, 32, 32);

        this.plant.render(false);
    },

    startCrawling: function() {
        this.plant.growing = true;
        this.crawlTimer = game.time.events.loop(Phaser.Timer.SECOND/2, this.crawlSurface, this);
    },

    crawlSurface: function() {
        this.plant.grow(0); // only one stem
        if (this.plant.getSurfaced(this.surfaceHeight)) {

            var newStem = this.plant.newStem(this.plant.growthStem, this.plant.growthStem.getLeafSpot());
            this.surfaceBaseStem = newStem;
            this.surfaceBaseSpot = newStem.getBase();

            game.time.events.remove(this.crawlTimer);
            this.plant.stopGrowing();

            this.mainTimer = this.getNewMainLoop();
            this.gameState = 2;
        }
        this.trackGrowth();
    },

    startGrowing: function() {
        this.growPlant();
        this.growthTimer = game.time.events.loop(Phaser.Timer.SECOND, this.growPlant, this);
        this.plant.startGrowing();
    },

    stopGrowing: function() {
        game.time.events.remove(this.growthTimer);
        this.plant.stopGrowing();

        this.mainTimer = this.getNewMainLoop(); //new main loop

        this.gameState = 2;

        // add a leaf if the grown stem is thick enough
        game.time.events.add(Phaser.Timer.SECOND*1.2, this.addLeaf, this);
    },

    growPlant: function() {
        if (!this.plant.hasNoEnergy()) {
            this.plant.grow(1);
            this.trackGrowth();
        } else {
            this.stopGrowing();
        }
    },

    tryGrowStem: function(side) {
        //find if a stem already exists near current traverse location
        var stem = this.plant.getStemNear(this.traverseTrackCoords);
        if (stem == null) {
            //stop traverse
            this.stopTraverse(false);
            //make new stem
            var ns = this.plant.newStem(this.plant.traverseStem, this.plant.traverseSpot, side ? 1 : -1);
            this.plant.growthStem = ns;

            this.startGrowing();

        } else {
            //jump to the other stem
            this.plant.startTraverse(stem, 0);
        }
    },

    addLeaf: function() {
        if (Math.random() < 0.2 + this.leafChance) {
            var pos = this.plant.growthStem.getLeaf();
            var dir = this.plant.growthStem.getDirAt(this.plant.growthStem.getLeafSpot());
            var rlist = ["leaf1", "leaf2", "leaf3"];
            this.leaves.push(new Leaf( choice(rlist), pos[0], pos[1], dir ));   

            this.leafChance = 0;   
        }

    },

    trackGrowth: function() {
        var newLeaf = this.plant.growthStem.getLeafPart();
        this.add.tween(this.cameraFocusPoint).to( {x: newLeaf[0], y: newLeaf[1]}, 500, Phaser.Easing.Linear.In, true);
    },

    trackSpot: function(spot) {
        var newSpot = spot;
        this.add.tween(this.cameraFocusPoint).to( {x: newSpot[0], y: newSpot[1]}, 500, Phaser.Easing.Linear.In, true);
    },

    trackBase: function() {
        this.trackSpot(this.surfaceBaseSpot);
    },

    trackTraverse: function() {
        this.trackSpot(this.plant.getTraverseCoords());
    },

    getNewMainLoop: function() {
        return game.time.events.add(Phaser.Timer.SECOND*2, this.mainLoop, this);
    },

    startGetEnergy: function() {
        this.plant.energy += 2.5;
        this.trackBase();

        this.energyTimer = game.time.events.add(Phaser.Timer.SECOND, this.stopGetEnergy, this);
    },

    stopGetEnergy: function() {
        this.gameState = 4; //TODO make 3

        game.time.events.remove(this.energyTimer);

        this.mainTimer = this.getNewMainLoop();
    },

    startTraverse: function() {
        this.traverse = true;
        this.plant.startTraverse(this.surfaceBaseStem, 0);

        this.traverseTimer = game.time.events.loop(Phaser.Timer.SECOND, this.trackTraverse, this);
    },

    stopTraverse: function(strength) {
        //make the stem thicker and longer
        this.traverse = false;
        if (strength) {
            this.plant.strengthenTraversed(this.strengthenAmount);
            this.strengthenAmount = this.strengthenBaseAmount;
        }
        this.plant.stopTraverse();

        game.time.events.remove(this.traverseTimer);

        //this.mainTimer = this.getNewMainLoop();

        //this.gameState = 2;
    },

    relocateWater: function(hit) {
        if (hit) {
            this.plant.energy += 3;
            this.leafChance = this.leafBaseChance;

            this.strengthenAmount += 1;
        }


        var t = this.add.tween(this.waterSprite).to({ alpha: 0 }, 200, Phaser.Easing.Linear.In, true);
        t.onComplete.add(function() {
            this.waterSprite.x = Math.random()*this.waterBounds[2] + this.waterBounds[0];
            this.waterSprite.y = Math.random()*this.waterBounds[2] + this.waterBounds[0];

            this.add.tween(this.waterSprite).to({ alpha: 1 }, 200, Phaser.Easing.Linear.In, true);
        }, this);

    },

    getTip: function() {
        if (this.surfaceBaseSpot == null) {
            return [-1000, -1000];
        } else {
            if (this.plant.growing) {
                var ret = this.plant.growthStem.getLeaf();
                if (typeof ret !== 'undefined') {
                    return ret;
                }
                
            }
        }
        return [-1000, -1000];
    },

    mainLoop: function() {
        //Pull resources for X time
        if (this.gameState == 2) {
            this.relocateWater(false);
            this.trackSpot(this.surfaceBaseSpot);
            this.startGetEnergy();
        } else if (this.gameState == 3) {
            //get input

        } else if (this.gameState == 4) {
            this.startTraverse();
        }
        
    }
}

function choice(list) {
    return list[Math.floor(Math.random()*list.length)];
}
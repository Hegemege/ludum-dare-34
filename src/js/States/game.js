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

        // Set up game variables
        this.surfaceHeight = 1210;
        this.groundline = game.add.graphics(0,0);
        this.groundline.lineStyle(4, 0x2E421A, 0.3);
        this.groundline.moveTo(0, this.surfaceHeight);
        this.groundline.lineTo(1600, this.surfaceHeight);

        this.plant = new Plant({"x" : 800, "y" : 1800});

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

        // DEBUG
        cursors = game.input.keyboard.createCursorKeys();

        var focuspoint = this.plant.growthStem.getBase();
        game.camera.focusOnXY(focuspoint[0], focuspoint[1]);
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

    },

    render: function() {
        //game.debug.cameraInfo(game.camera, 32, 32);

        this.plant.render(false);
    },

    startCrawling: function() {
        this.plant.growing = true;
        this.crawlTimer = game.time.events.loop(Phaser.Timer.SECOND, this.crawlSurface, this);
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
        console.log("start growing");
        this.growPlant();
        this.growthTimer = game.time.events.loop(Phaser.Timer.SECOND, this.growPlant, this);
        this.plant.startGrowing();
    },

    stopGrowing: function() {
        console.log("stop growing");
        game.time.events.remove(this.growthTimer);
        this.plant.stopGrowing();

        this.mainTimer = this.getNewMainLoop(); //new main loop

        this.gameState = 2;
    },

    growPlant: function() {
        console.log("grow plant");
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
            console.log("new stem");
            //stop traverse
            this.stopTraverse(false);
            //make new stem
            var ns = this.plant.newStem(this.plant.traverseStem, this.plant.traverseSpot, side ? 1 : -1);
            this.plant.growthStem = ns;

            this.startGrowing();

        } else {
            //jump to the other stem
            console.log("jump stem");
            this.plant.startTraverse(stem, 0);
        }
    },

    trackGrowth: function() {
        var newLeaf = this.plant.growthStem.getLeafPart();
        this.add.tween(this.camera).to( {x: newLeaf[0] - this.camera.width/2, y: newLeaf[1] - this.camera.height/2}, 500, Phaser.Easing.Linear.In, true);
    },

    trackSpot: function(spot) {
        var newSpot = spot;
        this.add.tween(this.camera).to( {x: newSpot[0] - this.camera.width/2, y: newSpot[1] - this.camera.height/2}, 500, Phaser.Easing.Linear.In, true);
    },

    trackBase: function() {
        this.trackSpot(this.surfaceBaseSpot);
    },

    trackTraverse: function() {
        this.trackSpot(this.plant.getTraverseCoords());
    },

    getNewMainLoop: function() {
        return game.time.events.add(Phaser.Timer.SECOND*4, this.mainLoop, this);
    },

    startGetEnergy: function() {
        console.log("get energy start");
        this.plant.energy += 5;
        this.trackBase();

        this.energyTimer = game.time.events.add(Phaser.Timer.SECOND*2, this.stopGetEnergy, this);
    },

    stopGetEnergy: function() {
        console.log("get energy stop");
        this.gameState = 4; //TODO make 3

        game.time.events.remove(this.energyTimer);

        this.mainTimer = this.getNewMainLoop();
    },

    startTraverse: function() {
        console.log("traverse start");
        this.traverse = true;
        this.plant.startTraverse(this.surfaceBaseStem, 0);

        this.traverseTimer = game.time.events.loop(Phaser.Timer.SECOND, this.trackTraverse, this);
    },

    stopTraverse: function(strength) {
        console.log("traverse stop");
        //make the stem thicker and longer
        this.traverse = false;
        if (strength) {
            this.plant.strengthenTraversed();
        }
        this.plant.stopTraverse();

        game.time.events.remove(this.traverseTimer);

        //this.mainTimer = this.getNewMainLoop();

        //this.gameState = 2;
    },

    mainLoop: function() {
        console.log("main loop start");
        //Pull resources for X time
        if (this.gameState == 2) {
            this.trackSpot(this.surfaceBaseSpot);
            this.startGetEnergy();
        } else if (this.gameState == 3) {
            //get input

        } else if (this.gameState == 4) {
            this.startTraverse();
        }
        
    }
}
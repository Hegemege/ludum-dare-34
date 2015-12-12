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
        this.groundline = game.add.graphics(0,0);
        this.groundline.lineStyle(4, 0x1C140A, 1);
        this.groundline.moveTo(0, 1200);
        this.groundline.lineTo(1600, 1200);

        this.plant = new Plant({"x" : 800, "y" : 1800});

        // Set up timed events
        game.time.events.loop(Phaser.Timer.SECOND/2, this.growPlant, this);

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
        if (cursors.left.isDown) {
            this.plant.growthStem.growDirection += 0.01;
        } else if (cursors.right.isDown) {
            this.plant.growthStem.growDirection -= 0.01;
        }

    },

    render: function() {
        game.debug.cameraInfo(game.camera, 32, 32);

        this.plant.render(false);
    },


    growPlant: function() {
        this.plant.grow();
        var newLeaf = this.plant.growthStem.getLeaf()
        this.add.tween(this.camera).to( {x: newLeaf[0] - this.camera.width/2, y: newLeaf[1] - this.camera.height/2}, 500, Phaser.Easing.Linear.In, true);
    }
}
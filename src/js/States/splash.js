var Splash = function () {};

Splash.prototype = {

    loadScripts: function () {
        game.load.script("PlantScript", "js/Objects/plant.js");
        game.load.script("MenuScript", "js/States/menu.js");
        game.load.script("GameScript", "js/States/game.js");
        
    },

    loadBgm: function () {
        game.load.audio('bgm', 'content/audio/main.ogg');
    },

    loadImages: function () {
        // Backgrounds
        game.load.image('gamebg', 'content/bg/wholebg.jpg');

        // Sprites
        game.load.image('seedspr', 'content/sprites/seed.png');
        game.load.image('trunkspr', 'content/sprites/trunk.png');
        game.load.image('blobspr', 'content/sprites/blob.png');
        game.load.image('blob2spr', 'content/sprites/blob2.png');

        game.load.image('waterspr', 'content/sprites/water.png');

        // Leaves

        game.load.image('leaf1spr', 'content/sprites/leaf1.png');
        game.load.image('leaf2spr', 'content/sprites/leaf2.png');
        game.load.image('leaf3spr', 'content/sprites/leaf3.png');
        game.load.image('leaf1rightspr', 'content/sprites/leaf1right.png');
        game.load.image('leaf2rightspr', 'content/sprites/leaf2right.png');
        game.load.image('leaf3rightspr', 'content/sprites/leaf3right.png');
    },

    loadFonts: function () {

    },

    init: function () {
        this.status = game.add.text(game.world.centerX, game.world.centerY, "Loading...", {fill: "white"});
        this.status.anchor.set(0.5);
    },

    // Preload game assets
    preload: function () {
        this.loadScripts(); 
        this.loadImages();
        this.loadFonts();
        this.loadBgm();
    }, 

    addGameStates: function () {
        game.state.add("Menu", Menu);
        game.state.add("Game", Game);
    },

    addGameMusic: function () {
        music = game.add.audio("bgm");
        music.loop = true;
        music.play();
        music.volume = 0.7;
    },

    create: function() {
        this.status.setText("Loaded!");
        this.addGameStates();
        this.addGameMusic();

        setTimeout(function () {
          game.state.start("Menu");
      }, 1000);
    }
}
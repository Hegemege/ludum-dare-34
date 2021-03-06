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
        game.load.image('menubg', 'content/bg/menu.png');
        game.load.image('tutorialbg', 'content/bg/tutorial.png');

        // Sprites
        game.load.image('seedspr', 'content/sprites/seed.png');
        game.load.image('trunkspr', 'content/sprites/trunk.png');
        game.load.image('blobspr', 'content/sprites/blob.png');
        game.load.image('blob2spr', 'content/sprites/blob2.png');

        game.load.image('waterspr', 'content/sprites/water.png');
        game.load.image('blackspr', 'content/sprites/black.png');

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
        this.sprite = game.add.sprite(0, 0, "loadingspr");
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

        this.addGameStates();
        this.addGameMusic();

        setTimeout(function () {
          game.state.start("Menu");
      }, 1000);
    }
}
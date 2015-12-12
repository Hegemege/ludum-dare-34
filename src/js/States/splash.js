var Splash = function () {};

Splash.prototype = {

    loadScripts: function () {
        game.load.script("MenuScript", "js/states/menu.js");
        game.load.script("GameScript", "js/states/game.js");
    },

    loadBgm: function () {

    },

    loadImages: function () {

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

    },

    create: function() {
        this.status.setText("Done!");
        this.addGameStates();
        this.addGameMusic();

        setTimeout(function () {
          game.state.start("Menu");
      }, 1000);
    }
}
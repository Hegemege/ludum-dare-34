var Menu = function () {};

var enterkey;

Menu.prototype = {

    init: function () {

    },

    preload: function () {

    }, 

    create: function() {
        this.bg = game.add.sprite(0, 0, "gamebg");
        this.bg2 = game.add.sprite(0, 0, "menubg");

        enterkey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterkey.onDown.add(this.startGame, this);


        
    },

    update: function() {

    },

    startGame: function() {
        game.state.start("Game");
    }
}
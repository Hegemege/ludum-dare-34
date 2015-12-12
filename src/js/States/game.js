var Game = function () {};

Game.prototype = {

    init: function () {

    },

    preload: function () {

    }, 

    create: function() {
        this.bg = game.add.sprite(0, 0, "gamebg");
        this.bg.anchor.set(0.5);

        this.kernel = game.add.sprite(game.world.centerX, game.world.centerY, "kernelspr");
        this.kernel.anchor.set(0.5);
    }
}
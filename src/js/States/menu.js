var Menu = function () {};

Menu.prototype = {

    init: function () {

    },

    preload: function () {

    }, 

    create: function() {
        game.state.start("Game");
    }
}
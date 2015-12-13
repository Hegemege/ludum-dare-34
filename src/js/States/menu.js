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
        this.bg3 = game.add.sprite(0, 0, "tutorialbg");
        this.bg3.visible = false;

        enterkey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterkey.onDown.add(this.hitEnter, this);

        this.tutcounter = 0;
        
    },

    update: function() {

    },

    hitEnter: function() {
        this.tutcounter += 1;
        if (this.tutcounter == 1) {
            this.bg2.visible = false;
            this.bg3.visible = true;
        }
        if (this.tutcounter == 2) {
            game.state.start("Game");
        }
    },
}
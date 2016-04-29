"use strict";

var TitleScreen = function() {
    PlayMusic("title");
};

TitleScreen.prototype = {
    selection: 0,
    update: function() {
        if (Controls.Enter || Controls.Shoot) {
            Controls.Enter = false;
            if (this.selection == 0) {
                // New Game
                Game.activate(true);
            } else if (this.selection == 1) {
                // Continue
                var saved = localStorage.getItem('saved');
                if (saved === null) {
                    PlaySound("die");
                } else {
                    Game.snapshot = JSON.parse(saved);
                    Game.activate(false);
                }
            } else if (this.selection == 2) {
                __debug = true;
                var saved = localStorage.getItem('saved');
                Game.snapshot = JSON.parse(saved);
                Game.activate(false);
            }
        } else if (Controls.Up) {
            if (this.selection != 0)
                this.selection--;
            Controls.Up = false;
        }   else if (Controls.Down) {
            if (this.selection != 2)
                this.selection++;
            Controls.Down = false;
        }
    },
    
    draw: function(ctx) {
        ctx.drawImage(Titleimage, 0, 0);
        drawText(ctx, 8*8, 10*8, "New Game");
        drawText(ctx, 8*8, 12*8, "Continue");
        drawText(ctx, 8*8, 14*8, "Debug Load");
        drawText(ctx, 6*8, (10 + (this.selection*2))*8, [26]);
        drawText(ctx, 2*8, 16*8, "(c) 2016 Nicole");
    },
};

var LogoScreen = {
    timer: 0,
    draw: function(ctx) {
        ctx.drawImage(Logo, 0*64, 0*64, 160, 144, 0, 0, 160, 144);
        this.sprite.draw(ctx);
    },
    update: function() {
        this.sprite.update();
        this.timer++;
        if (this.timer > 320) {
            runner = new TitleScreen();
        }
        if (this.timer == 110 || this.timer == 186)
            PlaySound("whistle");
        if (Controls.Enter) {
            Controls.Enter = false;
            runner = new TitleScreen();
        };
    },
    sprite: {
        frame: 0,
        frameTimer: 0,
        y: 64,
        x: 0,
        draw: function(ctx, jump) {
            var jump = this.y < 48;
            var drawx = this.x - 8;
            var drawy = this.y - 15;
            var offset = this.frame;
            ctx.drawImage(Logo, offset * 16, 144, 16, 16, drawx, drawy, 16, 16);
        },
        update: function() {
            if (LogoScreen.timer % 2 == 0)
                this.x = this.x + 1;
            this.frameTimer++;
            if (this.frameTimer == 20) {
                this.frameTimer = 0;
                this.frame = ((this.frame + 1) % 2);
            };
        }
    }
};

var TextScreen = function(text) {
    this.text = text;
};

TextScreen.prototype = {
    timer: 0,
    draw: function(ctx) {
        cycles = Math.floor(this.timer / 4) - (144 / 2);
        for (var i = 0; i < this.text.length; i++) {
            drawCenteredText(ctx, i*16 - cycles, this.text[i]);
        }
    },
    update: function() {
        this.timer++;
    },
};

var FlipScreen = function(oldscreen, newscreen, horz, newLeftTop) {
    this.oldscreen = oldscreen;
    this.newscreen = newscreen;
    this.horz = horz;
    this.newLeftTop = newLeftTop;
    this.timer = 0;
}

FlipScreen.prototype = {
    width: 160,
    
    height: 140 - 16,
    
    update: function() {
        this.timer = this.timer + 2;
        if (this.horz) {
            if (this.timer >= this.width)
                runner = Game;
        } else {
            if (this.timer >= this.height)
                runner = Game;
        }
    },
    
    draw: function(ctx) {
        var offsetx = 0;
        var offsety = 0;
        var screen1 = this.oldscreen; 
        var screen2 = this.newscreen;
        var timer = this.timer;
        var del = 1;
        if (this.newLeftTop)
            del = -1;
        if (this.horz) {
            this.drawRoom(ctx, screen1, del*timer, 0);
            this.drawRoom(ctx, screen2, del*(timer - this.width), 0);
        } else {
            this.drawRoom(ctx, screen1, 0, del*timer);
            this.drawRoom(ctx, screen2, 0, del*(timer - this.height));
        }
        // Draw UI box
        if (!this.horz) {
            ctx.clearRect(0, gamecanvas.height-16, gamecanvas.width, 16);
        }
        Game.drawUI(ctx);
    },
    
    drawRoom: function(ctx, room, offsetx, offsety) {
       var i = 0;
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 10; x++) {
                ctx.drawImage(Game.bgimage, 16 * room[i], 0, 16, 16, x * 16 + offsetx, y * 16 + offsety, 16, 16);
                i++;
            }
        };
    },
}
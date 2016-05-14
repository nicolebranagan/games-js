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
                runner = new OptionsScreen();
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
        drawText(ctx, 8*8, 14*8, "Options");
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
            runner = new TextScreen(openingText, function() {runner = new TitleScreen()}, true);
        }
        if (this.timer == 110 || this.timer == 186)
            PlaySound("whistle");
        if (Controls.Enter) {
            Controls.Enter = false;
            runner = new TextScreen(openingText, function() {runner = new TitleScreen()}, true);
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

var TextScreen = function(text, run, can_skip) {
    this.text = text;
    this.run = run;
    this.can_skip = can_skip;
};

TextScreen.prototype = {
    timer: 0,
    draw: function(ctx) {
        var cycles = Math.floor(this.timer / 6) - (144);
        for (var i = 0; i < this.text.length; i++) {
            drawCenteredText(ctx, i*16 - cycles, this.text[i]);
        }
    },
    update: function() {
        this.timer++;
        if (this.can_skip && Controls.Enter) {
            Controls.Enter = false;
            this.run();
        }
        if (this.timer > (144*3 + (this.text.length) * 128)) {
            this.run();
        }
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

var OptionsScreen = function() {
    this.music = ["title"].concat(Game.music);
    PlayMusic("");
}

OptionsScreen.prototype = {
    selection: 5,
    currentmusic: 0,
    currentpalette: 0,
    locations: [4*8, 6*8, 8*8, 11*8, 13*8, 16*8],
    
    draw: function(ctx) {
        drawCenteredText(ctx, 1*8, "Aspect Legend");
        drawCenteredText(ctx, 2*8, "Options");
        
        drawText(ctx, 3*8, 4*8, saveEnabled ? "Save game" : "Do not save game")
        drawText(ctx, 3*8, 6*8, musicEnabled ? "Music enabled" : "Music disabled");
        drawText(ctx, 3*8, 8*8, soundEnabled ? "Sound enabled" : "Sound disabled");
        drawText(ctx, 3*8, 11*8, "Palette " + this.currentpalette.toString());
        drawText(ctx, 3*8, 13*8, "Sound test");
        drawText(ctx, 5*8, 14*8, this.music[this.currentmusic]);
        
        drawText(ctx, 3*8, 16*8, "Return")
        
        drawText(ctx, 1*8, this.locations[this.selection], [26]);
    },
    
    update: function() {
        if (Controls.Enter || Controls.Shoot) {
            Controls.Enter = false;
            Controls.Shoot = false;
            if (this.selection == 0) {
                // Disable saving
                saveEnabled = !saveEnabled;
            } else if (this.selection == 1) {
                // Disable music
                PlayMusic("");
                musicEnabled = !musicEnabled;
            } else if (this.selection == 2) {
                // Disable sound
                soundEnabled = !soundEnabled;
            } else if (this.selection == 3) {
                // Change palette
            } else if (this.selection == 4) {
                // Sound test
                PlayMusic(this.music[this.currentmusic]);
            } else if (this.selection == 5) {
                // Return to title screen
                runner = new TitleScreen();
            }
        } else if (Controls.Up) {
            if (this.selection != 0)
                this.selection--;
            Controls.Up = false;
        }   else if (Controls.Down) {
            if (this.selection != 5)
                this.selection++;
            Controls.Down = false;
        }
        
        if (this.selection == 4) {
            if (Controls.Left) {
                Controls.Left = false;
                if (this.currentmusic != 0)
                    this.currentmusic--;
            } else if (Controls.Right) {
                Controls.Right = false;
                if (this.currentmusic != (this.music.length - 1))
                    this.currentmusic++;
            }
        }
    },
}

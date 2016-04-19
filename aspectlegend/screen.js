TitleScreen = {
    update: function() {
        if (Controls.Enter || Controls.Shoot) {
            Controls.Enter = false;
            if (selection == 0) {
                // New Game
                Game.activate(true);
            } else if (selection == 1) {
                // Continue
                var saved = localStorage.getItem('saved');
                if (saved === null) {
                    PlaySound("die");
                } else {
                    Game.snapshot = JSON.parse(saved);
                    Game.activate(false);
                }
            } else if (selection == 2) {
                __debug = true;
                var saved = localStorage.getItem('saved');
                Game.snapshot = JSON.parse(saved);
                Game.activate(false);
            }
        } else if (Controls.Up) {
            if (selection != 0)
                selection--;
            Controls.Up = false;
        }   else if (Controls.Down) {
            if (selection != 2)
                selection++;
            Controls.Down = false;
        }
    },
    
    draw: function(ctx) {
        ctx.drawImage(Titleimage, 0, 0);
        drawText(ctx, 8*8, 10*8, "New Game");
        drawText(ctx, 8*8, 12*8, "Continue");
        drawText(ctx, 8*8, 14*8, "Debug Load");
        drawText(ctx, 6*8, (10 + (selection*2))*8, [26]);
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
            runner = TitleScreen;
        }
        if (this.timer == 110 || this.timer == 186)
            PlaySound("whistle");
        if (Controls.Enter) {
            Controls.Enter = false;
            runner = TitleScreen;
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
}
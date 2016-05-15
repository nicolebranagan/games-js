"use strict";

var Subgame = function() {
    this.player.parent = this;
    PlayMusic("spiral");
    this.maxstages = SubgameStages.length - 1;
    this.getStage(0);
}

Subgame.prototype = {
    timer: 0,
    
    stage: 0,
    
    objects: [],
    
    deathCount: 0,
    
    getStage: function(index) {
        this.stage = index;
        this.objects = [];
        this.tiles = 0;
        var stage = SubgameStages[index];
        for (var i = 0; i < stage.tilemap.length; i++) {
            var check = stage.tilemap[i];
            var x = i % 10;
            var y = Math.floor(i / 10);
            
            if (check == 0)
                continue;
            this.objects.push(new SubgameTile(x * 16 + 4, y * 8 + 8, check - 1))
            this.tiles++;
        }
    },
    
    update: function() {
        this.timer++;
        if (this.deathCount > 0) {
            this.deathCount--;
            if (this.deathCount == 0)
                this.dieFunc();
        } else
            this.player.update();
            
        for (var i=0; i < this.objects.length; i++) {
            this.objects[i].update();
        }
        
        this.objects.forEach(function(e) {
            if (e.active == false) {
                var index = this.objects.indexOf(e);
                this.objects.splice(index, 1);
            }
        }, this);
        
        if (this.tiles == 0) {
            // get next stage
        }
    },
    
    draw: function(ctx) {
        var water = 76;
        var offset = Math.floor((this.timer/2)) % 16;
        var i = 0;
        for (var y = -1; y < 8; y++) {
            for (var x = 0; x < 10; x++) {
                ctx.drawImage(gfx.tiles, 16 * water, 0, 16, 16, x * 16, y * 16 + offset, 16, 16);
                i++;
            }
        };
        
        var drawable = this.objects.slice();
        if (this.deathCount === 0)
            drawable.push(this.player);
        drawable.sort(function(a, b) {
        return parseFloat(a.y) - parseFloat(b.y);
        });
        for (var i=0; i < drawable.length; i++) {
            drawable[i].draw(ctx);
        }
        
        this.drawUI(ctx);
    },
    
    drawUI: function(ctx) {
        ctx.clearRect(0, gamecanvas.height-16, gamecanvas.width, 16);
        drawText(ctx, 0, 144-16, " AREA  STAGE   CRYS ");
        drawNumber(ctx, 2*8, 144-8, 7, 2);
        drawText(ctx, 8*8, 144-8, (this.stage+1).toString() + "/" + (this.maxstages+1).toString(), 1);
        drawNumber(ctx, 16*8, 144-8, Game.crystals, 2);
        // draw keys, crystals
        ctx.drawImage(gfx.objects, 12 * 16, 0, 16, 16, 13*8, 144-16, 16, 16);
    },
    
    die: function() {
        if (this.deathCount > 0)
            return;
        this.objects.push(new Explosion(this.player.x, this.player.y));
        this.deathCount = 100;
        PlayMusic("");
        PlaySound("die");
    },
    
    dieFunc: function() {
        if (this.stage == 0) {
            Game.loadroom(Game.roomx, Game.roomy, true);
            runner = Game;
        }
        else
            this.getStage(this.stage - 1);
    },
    
    player: {
        x: 80,
        y: 96,
        aspect: 2,
        
        update: function() {
            if (Controls.Left) {
                this.x--;
            } else if (Controls.Right) {
                this.x++;
            }
            
            if (Controls.Shoot) {
                Controls.Shoot = false;
                this.parent.objects.push(new SubgameProjectile(this.parent, true, this.x, this.y));
            }
            
            if (this.x < 8)
                this.x = 8;
            if (this.x > 152)
                this.x = 152;
            
        },
        
        draw: function(ctx) {
            ctx.drawImage(gfx.objects, 16 * 11, 2 * 16, 16, 32, this.x - 8, this.y, 16, 32);
        }
    },
}
var SubgameProjectile = function(parent, up, x, y) {
    this.parent = parent;
    this.up = up;
    this.x = x;
    this.y = y;
    this.aspect = SubgameProjectile.aspect;
    SubgameProjectile.aspect = (SubgameProjectile.aspect + 1) % 3;
}

SubgameProjectile.aspect = 0;

SubgameProjectile.prototype = {
    active: true,
    
    update: function() {
        if (this.up)
            this.y--;
        else
            this.y++;
        if (this.y > 128)
            this.active = false;
        else if (this.y < 0)
            this.up = false;
            
        if (this.up) {
            for (var i = 0; i < this.parent.objects.length; i++) {
                var e = this.parent.objects[i];
                if (e instanceof SubgameTile) {
                    if (Math.abs(this.x - e.x) <= 8 && Math.abs(this.y - e.y) <= 4) {
                        //this.active = false;
                        this.up = !this.up;
                        e.active = false;
                        this.parent.tiles--;
                        break;
                    }
                }
            }
        }
        
        if (this.y > 90 && !this.up) {
            if (Math.abs(this.x - this.parent.player.x) < 4 && 
                Math.abs(this.y - this.parent.player.y) < 4)
                this.parent.die();
        }
    },
    
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 152 + 8 * this.aspect, 0, 8, 8, this.x - 4, this.y - 4, 8, 8)
    }
}

var SubgameTile = function(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
}

SubgameTile.prototype = {
    update: function() {
        
    },
    
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 12*16 + this.color*16, 2*16, 16, 8, this.x - 4, this.y - 8, 16, 8)
    }
}

var SubgameStages = [
    {
        tilemap: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 2, 1, 2, 1, 2, 0,
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
            0, 1, 2, 1, 2, 1, 2, 1, 2, 0,
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
    },
]
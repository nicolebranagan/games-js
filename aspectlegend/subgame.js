var Subgame = function() {
    this.player.parent = this;
    PlayMusic("spiral");
}

Subgame.prototype = {
    timer: 0,
    
    stage: 0,
    
    objects: [],
    
    update: function() {
        this.timer++;
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
        drawNumber(ctx, 9*8, 144-8, this.stage, 1);
        drawNumber(ctx, 16*8, 144-8, Game.crystals, 2);
        // draw keys, crystals
        ctx.drawImage(gfx.objects, 12 * 16, 0, 16, 16, 13*8, 144-16, 16, 16);
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
                this.parent.objects.push(new SubgameProjectile(true, this.x, this.y));
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
var SubgameProjectile = function(up, x, y) {
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
        if (this.y < 0 || this.y > 128)
            this.active = false;
    },
    
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 152 + 8 * this.aspect, 0, 8, 8, this.x - 4, this.y - 4, 8, 8)
    }
}
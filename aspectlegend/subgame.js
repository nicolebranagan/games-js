"use strict";

var Subgame = function() {
    this.player.parent = this;
    this.playMusic();
    this.maxstages = SubgameStages.length - 1;
    this.objects = [];
    //this.getStage(0);
}

Subgame.prototype = {
    timer: 0,
    
    stage: -1,
    
    lives: 5,
    
    objects: [],
    
    enemies: [],
    
    winCount: 0,
    
    deathCount: 0,
    
    paused: false,
    
    playMusic: function() {
        PlayMusic("spiral");
    },
    
    getStage: function(index) {
        this.stage = index;
        this.tiles = 0;
        var stage = SubgameStages[index];
        this.stagedata = stage;
        this.enemies = stage.enemies.slice(0);
        var newobjects = []
        for (var i = 0; i < this.objects; i++) {
            var obj = this.objects[i];
            if (obj instanceof SubgameProjectile)
                newobjects.push(obj);
            else
                newobjects.push(new Explosion(obj.x, obj.y));
        }
        this.objects = newobjects;
        for (var i = 0; i < stage.tilemap.length; i++) {
            var check = stage.tilemap[i];
            var x = i % 10;
            var y = Math.floor(i / 10);
            
            if (check == 0)
                continue;
            this.objects.push(new SubgameTile(x * 16 + 4, y * 8 + 8, check - 1))
            this.tiles++;
        }
        this.timer = this.timer % 16;
    },
    
    update: function() {
        if (this.paused) {
            if (Controls.Enter) {
                Controls.Enter = false;
                PauseMusic();
                this.paused = false;
            }
            return;
        }
        this.timer++;
        if (this.stage == -1 && this.timer > 100)
            this.getStage(0);
        else if (this.stage > -1) {
            if (this.timer > this.stagedata.loop_point)
                this.timer = this.timer % 16;
        }
        if (this.deathCount > 0) {
            this.deathCount--;
            if (this.deathCount == 0)
                this.dieFunc();
        } else {
            this.player.update();
            if (Controls.Enter) {
                this.paused = true;
                Controls.Enter = false;
                PauseMusic();
            }
        }
            
        if (this.winCount > 0) {
            this.winCount--;
            if (this.winCount == 0)
                this.winFunc();
        } else
            this.enemyGovernor();
            
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
            this.win();
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
        var layoutstring = " AREA  STAGE   LIFE ";
        if (this.paused)
            layoutstring = " AREA  PAUSE   LIFE ";
        drawText(ctx, 0, 144-16, layoutstring);
        drawNumber(ctx, 2*8, 144-8, 7, 2);
        drawText(ctx, 8*8, 144-8, ((this.stage == -1 ? 1 : this.stage+1).toString()) + "/" + (this.maxstages+1).toString(), 1);
        drawNumber(ctx, 16*8, 144-8, this.lives, 2);
        // draw self
        ctx.drawImage(gfx.objects, (this.lives % 2 * 16), 0, 16, 16, 13*8, 144-16, 16, 16);
    },
    
    win: function() {
        if (this.winCount > 0)
            return;
        this.winCount = 100;
        this.tiles = 1;
        // TODO: Sound effect    
    },
    
    winFunc: function() {
        if (this.stage != this.maxstages) {
            this.getStage(this.stage + 1);
        }
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
        if (this.lives == 1) {
            Game.loadroom(Game.roomx, Game.roomy, true);
            runner = Game;
        }
        else {
            this.lives--;
            this.getStage(this.stage);
            this.playMusic();
        }
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
                PlaySound("pew");
                this.parent.objects.push(new SubgameProjectile(this.parent, true, this.x, this.y));
            }
            
            if (this.x < 8)
                this.x = 8;
            if (this.x > 152)
                this.x = 152;
            
        },
        
        draw: function(ctx) {
            ctx.drawImage(gfx.objects, 16 * 11, 2 * 16, 16, 24, this.x - 8, this.y, 16, 24);
        }
    },
    
    enemyGovernor: function() {
        for (var i = 0; i < this.enemies.length; i++) {
            var enem = this.enemies[i];
            if (enem.time == this.timer) {
                this.objects.push(new SubgameEnemy(this, enem.x, enem.type, enem.freq));
            }
        }
    }
};

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
            
        for (var i = 0; i < this.parent.objects.length; i++) {
            var e = this.parent.objects[i];
            if (this.up && e instanceof SubgameTile) {
                if (Math.abs(this.x - e.x) <= 8 && Math.abs(this.y - e.y) <= 4) {
                    //this.active = false;
                    this.up = !this.up;
                    e.active = false;
                    this.parent.tiles--;
                    break;
                }
            } else if (this.up && e instanceof SubgameEnemy) {
                if (Math.abs(this.x - e.x) <= 8 && Math.abs(this.y - e.y) <= 4) {
                    this.active = false;
                    e.active = false;
                    this.parent.objects.push(new Explosion(e.x, e.y));
                    break;
                }
            }
        }
        
        if (this.y > 90 && !this.up) {
            if (Math.abs(this.x - this.parent.player.x) < 4 && 
                Math.abs(this.y - this.parent.player.y) < 4) {
                this.active = false;
                this.parent.die();
            }
        }
    },
    
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 152 + 8 * this.aspect, 0, 8, 8, this.x - 4, this.y - 4, 8, 8)
    }
}

var SubgameTile = function(x, y, color) {
    this.x = x;
    this.ygoal = y;
    this.y = 0;
    this.color = color;
}

SubgameTile.prototype = {
    update: function() {
        if (this.y != this.ygoal)
            this.y++;
    },
    
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 12*16 + this.color*16, 2*16, 16, 8, this.x - 4, this.y - 8, 16, 8)
    }
}

var SubgameEnemy = function(parent, x, type, freq) {
    this.parent = parent;
    this.x = x;
    this.type = type;
    this.frequency = freq;
    this.timer = 0;
    
    if (this.type == 0)
        this.update = this.birdbrain;
    else if (this.type == 1) {
        this.update = this.orbbrain;
        this.downtimer = 8;
        this.left = (this.x > 80);
    }
}

SubgameEnemy.prototype = {
    y: 0,
    
    ymax: 96,
    
    birdbrain: function() {
        this.timer++;
        if (this.y > this.ymax) {
            this.y++;
            if (this.y > (144 - 8))
                this.active = false;
            return;
        }
        if (this.timer % 4 == 0) {
            this.y = this.y + 1;
            if (this.x > this.parent.player.x)
                this.move(-1);
            else if (this.x < this.parent.player.x)
                this.move(+1);
        }
        if (this.timer % 64 == 0) {
            this.parent.objects.push(new SubgameProjectile(this.parent, false, this.x, this.y));
        }
    },
    
    orbbrain: function() {
        this.timer++;
        if (this.y > this.ymax) {
            this.y++;
            if (this.y > (144 - 8))
                this.active = false;
            return;
        } else if (this.timer % 2 == 0) {
            if (this.downtimer == 0) {
                if (this.left)
                    this.x = this.x - 1;
                else
                    this.x = this.x + 1;
                if (this.x >= (144) || this.x < 8) {
                    this.downtimer = 16;
                }
            } else {
                this.downtimer--;
                this.y = this.y + 1;
                if (this.downtimer == 0) {
                    this.left = !this.left;
                }
            }
        }
        if (this.timer % 128 == 0) {
            this.parent.objects.push(new SubgameProjectile(this.parent, false, this.x, this.y));
        }
    },
    
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 12*16 + this.type*16, 2*16 + 8, 16, 16, this.x - 8, this.y - 8, 16, 16)
    },
    
    move: function(delta) {
        for (var i = 0; i < this.parent.objects.length; i++) {
            var e = this.parent.objects[i];
            if (e === this)
                continue;
            if (!(e instanceof SubgameEnemy))
                continue;
            if (Math.abs((this.x + delta) - e.x) <= 8 && Math.abs(this.y - e.y) <= 4) {
                return false;
            }
        }
        this.x = this.x + delta;
        return true;
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
            0, 1, 2, 1, 2, 1, 2, 1, 2, 0,
        ],
        
        enemies: [
            {
                time: 900,
                type: 0,
                x: 80,
                freq: 128,
            },
            {
                time: 1200,
                type: 0,
                x: 80,
                freq: 128,
            },
            {
                time: 2400,
                type: 0,
                x: 80,
                freq: 128,
            },
        ],
        
        loop_point: 2700

    },
    {
        tilemap: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
            0, 2, 2, 0, 1, 1, 0, 2, 2, 0,
            0, 2, 0, 0, 0, 0, 0, 0, 2, 0,
            0, 2, 2, 2, 0, 0, 2, 2, 2, 0,
            0, 0, 0, 2, 0, 0, 2, 0, 0, 0,
            0, 1, 0, 2, 0, 0, 2, 0, 1, 0,
        ],
        
        enemies: [
            {
                time: 500,
                type: 0,
                x: 0,
                freq: 128,
            },
            {
                time: 550,
                type: 0,
                x: 0,
                freq: 164,
            },
            {
                time: 600,
                type: 0,
                x: 0,
                freq: 128,
            },
            
            {
                time: 900,
                type: 0,
                x: 160,
                freq: 128,
            },
            {
                time: 950,
                type: 0,
                x: 160,
                freq: 164,
            },
            {
                time: 1000,
                type: 0,
                x: 160,
                freq: 128,
            },
        ],
        
        loop_point: 1500,
    },
    {
        tilemap: [
            0, 0, 0, 0, 2, 2, 0, 0, 0, 0,
            0, 0, 2, 2, 1, 1, 2, 2, 0, 0,
            2, 2, 1, 1, 2, 2, 1, 1, 2, 2,
            1, 1, 2, 2, 1, 1, 2, 2, 1, 1,
            2, 2, 1, 1, 2, 2, 1, 1, 2, 2,
            1, 1, 2, 2, 0, 0, 2, 2, 1, 1,
            2, 2, 0, 0, 0, 0, 0, 0, 2, 2,
        ],
        enemies: [
            {
                time: 900,
                type: 1,
                x: 80,
                freq: 128,
            },
            {
                time: 1000,
                type: 1,
                x: 80,
                freq: 128,
            },
            {
                time: 1100,
                type: 1,
                x: 80,
                freq: 128,
            },
        ],
        loop_point: 1101,
    },
    
    {   
        tilemap: [],
        enemies: [],
        loop_point: 100,
    },
]
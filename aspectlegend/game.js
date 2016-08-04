"use strict";

var GameStage = {
    RunMode: 0,
    DieMode: 1,
    WinMode: 2,
    PauseMode: 3,
    TextMode: 4,
}

var Game = {
    keys: 0,
    area: 0,
    crystals: 0,
    flipped: false,
    music: ["mystery","cave","frenzy","under","right","march","firmly","bold","distance","chant"],
    
    activate: function(newgame) {
        PlaySound("aspect");

        this.reset(newgame);
        runner = this;
    },

    reset: function(newgame) {
        this.player = new Player();
        this.player.frozen = false;

        // Clean worldfile
        worldfile.rooms.forEach(function(e1, i) {
            if (e1 != 0) {
                e1.objects.forEach(function(e2, j) {
                    e2[3] = true;
                });
            }
        });
        
        if (newgame) {
            // Prepare blank snapshot;
            this.snapshot = { x: this.player.x, y: this.player.y, aspect: 0, roomx: 3, roomy: 3, keys: 0, crystals: 0, flipped: false, objects: [] }
            for(var i=0; i < worldfile.rooms.length; i++) {
                var e = worldfile.rooms[i]
                if (e != 0) {
                    var invar = [];
                    for(var j=0; j<e.objects.length; j++) {
                        invar[j] = true;
                    }
                    this.snapshot.objects[i] = invar;
                }
            }
        }
        this.reload();
    },

    reload: function() {
        if (__debug) {
            this.shootLag = 0;
            this.player.x = this.snapshot.x;
            this.player.y = this.snapshot.y;
            this.player.aspect = this.snapshot.aspect;
            this.keys = this.snapshot.keys;
            this.crystals = this.snapshot.crystals;
            this.mode = GameStage.RunMode;
            this.loadroom(this.snapshot.roomx, this.snapshot.roomy, true);
            return;
        }
        this.shootLag = 0;
        this.lag = 0;
        this.player.x = this.snapshot.x;
        this.player.y = this.snapshot.y;
        this.player.aspect = this.snapshot.aspect;
        this.keys = this.snapshot.keys;
        this.crystals = this.snapshot.crystals;
        this.flipped = this.snapshot.flipped;
        for(var i=0; i < worldfile.rooms.length; i++) {
            var e = worldfile.rooms[i]
            if (e != 0) {
                for(var j=0; j<e.objects.length; j++) {
                    if (typeof this.snapshot.objects[i][j] != "undefined")
                        e.objects[j][3] = this.snapshot.objects[i][j];
                    else
                        e.objects[j][3] = true;
                }
            }
        }

        this.mode = GameStage.RunMode;
        this.loadroom(this.snapshot.roomx, this.snapshot.roomy, true);
    },

    save: function() {
        this.snapshot = { x: this.player.x, y: this.player.y, aspect: this.player.aspect, roomx: this.roomx, roomy: this.roomy, keys: this.keys, crystals: this.crystals, objects: [] }
        for(var i=0; i < worldfile.rooms.length; i++) {
            var e = worldfile.rooms[i]
            if (e != 0) {
                var invar = [];
                for(var j=0; j < e.objects.length; j++) {
                    invar[j] = e.objects[j][3];
                }
                this.snapshot.objects[i] = invar;
            }
        }
        if (saveEnabled)
            localStorage.setItem('saved', JSON.stringify(this.snapshot));
    },

    loadroom: function(x, y, skip) {
        var oldarea = this.area;
        var oldroom = this.tileMap;
        var oldx = this.roomx;
        var oldy = this.roomy;
        this.roomx = x;
        this.roomy = y;
        this.tileMap = worldfile.rooms[x + y * 16].tiles;
        
        // Don't change area if area == -1
        if (worldfile.rooms[x + y * 16].area !== -1) {
            this.area = worldfile.rooms[x + y * 16].area;
            PlayMusic(this.music[this.area]);
        }

        this.objects = new Array();
        this.blocks = new Array();
        var objects = worldfile.rooms[x + y * 16].objects;
        objects.forEach(function(item, index, array) {
            if (item[0] < 100) {
                Game.objects.push(
                    getEnemy(item));
            } else if (item[0] < 200) {
                Game.blocks.push(new Block(item));
            } else {
                Arbitrary(item);
            }
        });
        if (!skip && this.area != 9 && oldarea != 9)
            runner = new FlipScreen(oldroom, this.tileMap, oldx != x, oldx < x || oldy < y);
    },

    tryloadroom: function(x, y) {
        if (x < 0 || y < 0 || x >= 16 || y >= 16)
            return false;
        if (worldfile.rooms[x + y * 16] == 0)
            return false;
        this.loadroom(x, y, false)
        return true;
    },

    update: function() {
        if (this.mode == GameStage.RunMode) {
            if (Controls.Enter) {
                this.lag = 20;
                Controls.Enter = false;
                this.mode = GameStage.PauseMode;
                PlaySound("pause");
                PauseMusic();
            }
            if (Controls.Reset) {
                Controls.Reset = false;
                Enemy.prototype.collect();
            }
            this.player.moving = false;
            if (Controls.Up && !this.player.frozen) {
                this.player.moving = true;
                this.player.direction = 1;
            } else if (Controls.Down && !this.player.frozen) {
                this.player.moving = true;
                this.player.direction = 0;
            } else if (Controls.Left && !this.player.frozen) {
                this.player.moving = true;
                this.player.direction = 2;
            } else if (Controls.Right && !this.player.frozen) {
                this.player.moving = true;
                this.player.direction = 3;
            }
            if (this.shootLag <= 0) {
                if (Controls.Shoot) {
                    this.shootLag = 50;
                    var spoke = false;
                    var speaker = null;
                    var dist_to_speaker = Infinity;
                    for(var i = 0; i < Game.objects.length; i++) {
                        var e = Game.objects[i];
                        var d = (e.x-Game.player.x)*(e.x-Game.player.x) + (e.y-Game.player.y)*(e.y-Game.player.y);
                        if (d < 24*24) {
                            if (e.speak && d < dist_to_speaker) {
                                speaker = e;
                                dist_to_speaker = d;
                                //e.speak();
                                spoke=true;
                                //break;
                            }
                        }
                    }
                    if (spoke) {
                        speaker.speak();
                    } else {
                        PlaySound("pew");
                        this.objects.push(new Projectile(this.player.x, this.player.y,  this.player.direction, this.player.aspect));
                    }
                }
            } else
                this.shootLag = this.shootLag - 1;

            this.player.update();

            this.objects.forEach(function(e) {
                e.update();
                if (e.active == false) {
                    var index = Game.objects.indexOf(e);
                    Game.objects.splice(index, 1);
                } else if (Math.pow(e.x - Game.player.x, 2) + Math.pow(e.y - Game.player.y, 2) < 100) {
                    e.collect()
                }
            });
            this.blocks.forEach(function(e) {
                e.update();
                if (e.active == false) {
                    var index = Game.blocks.indexOf(e);
                    Game.blocks.splice(index, 1);
                }
            });
        } else if (this.mode == GameStage.DieMode || this.mode == GameStage.WinMode) {
            this.animCount = this.animCount - 2;
            if (this.animCount <= 0) {
                if (this.mode == GameStage.DieMode)
                    this.reload();
                else {
                    activated = false;
                }
            }
        } else if (this.mode == GameStage.PauseMode) {
            if (this.lag > 0) {
                this.lag = this.lag - 1;
            } else {
                if (Controls.Enter) {
                    this.mode = GameStage.RunMode;
                    this.lag = 20;
                    Controls.Enter = false;
                    PauseMusic();
                }
            }
        } else if (this.mode == GameStage.TextMode) {
            this.updateText();
        }
    },
    
    updateText: function() {
        if (this.lag > 0) {
            this.lag = this.lag - 1;
        } else {
            if (Controls.Shoot) {
                this.step = this.step + 2;
                if (this.step >= this.displayText.length) {
                    this.mode = GameStage.RunMode;
                    this.lag = 20;
                }
                Controls.Shoot = false;
            }
        }
    },
    
    draw: function(ctx) {
        ctx.imageSmoothingEnabled = false
        this.drawRoom(ctx);
        //if (this.mode == GameStage.RunMode) {
        ctx.globalAlpha = 1.0;
        /*}
        else if (this.mode != GameStage.PauseMode) {
            ctx.globalAlpha = this.animCount / 255;
        }*/
        if (this.mode != GameStage.PauseMode) {
            var drawable = this.objects.slice();
            drawable.push(this.player);
            drawable.sort(function(a, b) {
            return parseFloat(a.y) - parseFloat(b.y);
            });
            for (var i=0; i < drawable.length; i++) {
                drawable[i].draw(ctx);
            }
            /*this.objects.forEach(function(e) {
                e.draw(ctx)
            });
            this.player.draw(ctx);*/
            
        }
        if (this.mode == GameStage.WinMode) {
            this.player.draw(ctx);
        }
        if (this.mode == GameStage.TextMode) {
            this.drawText(ctx)
        } else
            this.drawUI(ctx);
    },

    drawRoom: function(ctx) {
        var i = 0;
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 10; x++) {
                ctx.drawImage(gfx.tiles, 16 * this.tileMap[i], 0, 16, 16, x * 16, y * 16, 16, 16);
                i++;
            }
        }
        this.blocks.forEach(function(e) {
            e.draw(ctx);
        });
    },
    
    drawText: function(ctx) {
        ctx.clearRect(0, 104, 160, 40);
        drawText(ctx, 8, 112, this.displayText[this.step]);
        drawText(ctx, 8, 128, this.displayText[this.step + 1]);
    },
    
    drawUI: function(ctx) {
        drawText(ctx, 0, 144-16, " AREA   KEYS   CRYS ");
        drawNumber(ctx, 2*8, 144-8, this.area, 2);
        drawNumber(ctx, 9*8, 144-8, this.keys, 2);
        drawNumber(ctx, 16*8, 144-8, this.crystals, 2);
        // draw keys, crystals
        ctx.drawImage(gfx.objects, 11 * 16, 0, 16, 16, 6*8, 144-16, 16, 16);
        ctx.drawImage(gfx.objects, 12 * 16, 0, 16, 16, 13*8, 144-16, 16, 16);
    },

    textBox: function(text) {
        var newtext = [];
        for(var i=0; i < text.length; i++) {
            var str = "";
            var words = text[i].split(" ");
            for(var j=0; j < words.length; j++) {
                var word = words[j];
                if (word.length + str.length > 18) {
                    newtext.push(str);
                    str = word + " ";
                } else {
                    str = str + word + " ";
                }
            }
            newtext.push(str);
            if (newtext.length % 2 != 0)
                newtext.push("");
        }
        this.displayText = newtext;
        this.step = 0;
        this.mode = GameStage.TextMode;
        this.lag = 20;
        Controls.Shoot = false;
    },

    // Functions regarding the map
    isSolid: function(x, y, self) {
        var tile = Game.getTile(x, y)
        if (tile == 1)
            return true;
        else if (tile == 5 && !(self instanceof Player || self instanceof Projectile))
            return true;
        else if (tile == 8 && !(self instanceof Projectile))
            return true;
        
        var pass = false;
        for(var i = 0; i < Game.blocks.length; i++) {
            var block = Game.blocks[i];
            if ((Math.abs(block.x - x) < 8 || x - block.x == -8) && 
                (Math.abs(block.y - y) < 8 || y - block.y == -8)) {
                if (self instanceof Player)
                    pass = pass || block.collide();
                else
                    pass = pass || (block.contact ? block.contact(self) : true); //return true;
            }
        }
        
        if (tile == 6 && self instanceof Player)
            return true;
        else
            return pass;
        
    },

    getTile: function(x, y) {
        var i = Math.floor(x / 16) + 10 * Math.floor(y / 16);
        return worldfile.key[this.tileMap[i]];
    },

    squareSolid: function(x, y, self) {
        // Checks whether a square centered at loc is at all solid
        return Game.isSolid(x, y - 6, self) || Game.isSolid(x, y + 6, self) ||
            Game.isSolid(x - 6, y, self) || Game.isSolid(x + 6, y, self) ||
            Game.isSolid(x - 6, y - 6, self) || Game.isSolid(x - 6, y + 6, self) ||
            Game.isSolid(x + 6, y - 6, self) || Game.isSolid(x + 6, y + 6, self);
    },
}

// GameObject
function GameObject() {
    this.active = true;
    this.x = 5 * 16;
    this.y = 3 * 16 + 8;
    this.currentFrame = 0;
    this.stallCount = 0;
    this.moving = false;
    this.direction = 0;
    this.row = 0;
    this.aspect = 0;
}

GameObject.prototype = {
    speed: 2,

    stallCountMax: 20,

    offset: 0,

    draw: function(ctx) {
        // Slice image
        ctx.drawImage(gfx.objects, 16 * (2 * this.direction + this.currentFrame + this.offset), this.row * 16, 16, 16, this.x - 8, this.y - 8, 16, 16);
        this.drawAspect(ctx);
    },
    
    drawAspect: function(ctx) {
        if (this.aspect != -1 && Game.area != 0 && Game.area != 2)
            ctx.drawImage(gfx.objects, 128 + 8 * this.aspect, 0, 8, 8, this.x - 4, this.y - 16, 8, 8)
    },
    
    animate: false,

    _update: function() {
        this.stallCount = this.stallCount + 1;
        if (this.stallCount == this.stallCountMax) {
            this.stallCount = 0;
        }
        if (this.stallCount == 0) {
            this.currentFrame = (this.currentFrame + 1) % 2;
            if (!this.moving && !this.animate) this.currentFrame = 0;
        }
        if (this.moving) {
            if (this.stallCount % this.speed == 0) {
                switch (this.direction) {
                    case 0:
                        this.move(0, 1);
                        break;
                    case 1:
                        this.move(0, -1);
                        break;
                    case 2:
                        this.move(-1, 0);
                        break;
                    case 3:
                        this.move(1, 0);
                        break;
                }
            }
        }
    },

    update: function() {
        this._update();
    },

    boundscheck: function(x, y) {
        return
    },

    move: function(x, y) {
        var testx = this.x + x;
        var testy = this.y + y;
        if (testx < 8 || testy < 8 || testx >= 154 || testy >= 120) {
            this.boundscheck(testx, testy)
        } else if (!Game.squareSolid(testx, testy, this)) {
            this.x = testx;
            this.y = testy;
        }

        var tile = Game.getTile(this.x, this.y);
        var oldaspect = this.aspect
        
        if (tile == 2)
            this.aspect = 0
        else if (tile == 3)
            this.aspect = 1
        else if (tile == 4)
            this.aspect = 2
        if (oldaspect != this.aspect)
            PlaySound("aspect")
    },
    
    recoil: function(x, y, dir) {
        if (!dir) dir = this.direction;
        switch (dir) {
            case 0:
                this.move(0, -1);
                break;
            case 1:
                this.move(0, 1);
                break;
            case 2:
                this.move(1, 0);
                break;
            case 3:
                this.move(-1, 0);
                break;
        }
    },

    collect: function() {}
}

function Player() {
    this.drawx = this.draw;
    this.draw = function(ctx) {
        if (Game.mode != GameStage.DieMode)
            this.drawx(ctx);
        else {
            // Death animation
            this.stallCount = this.stallCount + 1;
            if (this.stallCount == this.stallCountMax) {
                this.stallCount = 0;
            }
            if (this.stallCount == 0) {
                this.currentFrame = (this.currentFrame + 1) % 2;
            }
            
            ctx.drawImage(gfx.objects, (14 + this.currentFrame)*16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
            this.drawAspect(ctx);
        }
    };
};
Player.prototype = new GameObject();
Player.prototype.stallCountMax = 20;
Player.prototype.boundscheck = function(x, y) {
    var delx = 0
    var dely = 0
    if (x < 8)
        delx = -1
    else if (y < 8)
        dely = -1
    else if (x >= 154)
        delx = 1
    else if (y >= 120)
        dely = 1
    if (Game.tryloadroom(Game.roomx + delx, Game.roomy + dely)) {
        if (delx == -1)
            this.x = 152
        else if (delx == 1)
            this.x = 8
        else if (dely == -1)
            this.y = 118
        else if (dely == 1)
            this.y = 8
    }
}

function Enemy() {}
Enemy.prototype = new GameObject();
Enemy.prototype.row = 3;
Enemy.prototype.speed = 4; // formerly 3
Enemy.prototype.update = function() {
    this.moving = true;
    this._update();
    if (this.stallCount % 6 != 0) { // Slowness
        if (getRandomInt(0, 10) <= 1) {
            if (getRandomInt(0, 10) > 1) {
                // Move towards the target
                var x_tar = this.x - Game.player.x;
                var y_tar = this.y - Game.player.y;
                var targetDir = -1;
                if (Math.abs(x_tar) > Math.abs(y_tar)) {
                    if (x_tar > 0)
                        targetDir = 2;
                    else
                        targetDir = 3;
                } else {
                    if (y_tar > 0)
                        targetDir = 1;
                    else
                        targetDir = 0;
                }
                this.direction = targetDir;
            } // else
                //this.faceDir = getRandomInt(0, 4);
        }
    }
};

Enemy.prototype.collect = function() {
    Game.mode = GameStage.DieMode;
    Game.animCount = 512;
    PlayMusic();
    PlaySound("die");
}
Enemy.prototype.hurt = function(aspect) {
    if (aspect == this.aspect) {
        Game.objects.push(new Explosion(this.x, this.y));
        this.active = false;
    }
}

var getEnemy = function(invar) {
    var enemy = new Enemy();
    enemy.x = invar[1] * 16 + 8;
    enemy.y = invar[2] * 16 + 8;
    enemy.type = Math.floor(invar[0] / 3);
    enemy.aspect = invar[0] % 3;
    enemy.row = enemy.type + 8;
    if (enemy.type == 0) {
        // Still Enemy
        enemy.speed = 0;
    } else if (enemy.type == 1) {
        // Demon, circles around tile
        enemy.moving = false;
        enemy.phase = enemy.aspect * Math.PI / 2;
        enemy.rootx = enemy.x;
        enemy.rooty = enemy.y;
        enemy.radius = 16;
        //enemy.stallCountMax = 20;
        enemy.animate = true;
        enemy.update = function() {
            this._update();
            if (this.stallCount % 4 == 0) {
                this.phase = this.phase + (2 * Math.PI) / 50;
                if (this.phase > 2 * Math.PI)
                    this.phase = this.phase - 2 * Math.PI;
                this.x = Math.floor(this.rootx + this.radius*Math.cos(this.phase));
                this.y = Math.floor(this.rooty + this.radius*Math.sin(this.phase));
                
                var x_tar = this.x - Game.player.x;
                var y_tar = this.y - Game.player.y;
                var targetDir = -1;
                if (Math.abs(x_tar) > Math.abs(y_tar)) {
                    if (x_tar > 0)
                        targetDir = 2;
                    else
                        targetDir = 3;
                } else {
                    if (y_tar > 0)
                        targetDir = 1;
                    else
                        targetDir = 0;
                }
                this.direction = targetDir;
            }
        }
    } else if (enemy.type == 2) {
        // Rat, crawls along walls
        enemy.direction = 2;
        enemy.moving = true;
        enemy.update = function() {
            this._update();
            //this.moving = true;
            if (this.stallCount % 6 == 0) {
                var x = this.x;
                var y = this.y;
                if (Game.isSolid(this.x, this.y)) {
                    this.moving = false;
                    return;
                } else {
                    this.moving = true;
                }
                if (this.direction == 0)
                    y = y + 1;
                else if (this.direction == 1)
                    y = y - 1;
                else if (this.direction == 2)
                    x = x - 1;
                else if (this.direction == 3)
                    x = x + 1;
                
                if (Game.squareSolid(x, y, this) || (x < 8 || y < 8 || x >= 154 || y >= 120)) {
                    var tilex = Math.floor(this.x / 16)*16 + 8;
                    var tiley = Math.floor(this.y / 16)*16 + 8;
                    
                    var blocked0 = Game.isSolid(tilex, tiley + 16, this);
                    var blocked1 = Game.isSolid(tilex, tiley - 16, this);
                    var blocked2 = Game.isSolid(tilex - 16, tiley, this);
                    var blocked3 = Game.isSolid(tilex + 16, tiley, this);
                    
                    if ((blocked0 && blocked1 && blocked2 && blocked3)) {
                        this.moving = false;
                        this.animate = true;
                    } else if (blocked1 && blocked2 && blocked3) {
                        this.direction = 0;
                    } else if (blocked0 && blocked2 && blocked3) {
                        this.direction = 1;
                    } else if (blocked0 && blocked1 && blocked3) {
                        this.direction = 2;
                    } else if (blocked0 && blocked1 && blocked2) {
                        this.direction = 3;
                    } else if (this.direction == 0) {
                        if (blocked2)
                            this.direction = 3;
                        else
                            this.direction = 2;
                    } else if (this.direction == 1) {
                        if (blocked3)
                            this.direction = 2;
                        else
                            this.direction = 3;
                    } else if (this.direction == 2) {
                        if (blocked0)
                            this.direction = 1;
                        else
                            this.direction = 0;
                    } else if (this.direction == 3) {
                        if (blocked1)
                            this.direction = 0;
                        else
                            this.direction = 1;
                    }
                }
            }
        }
    }
    return enemy;
}

function Projectile(x, y, dir, aspect) {
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.aspect = aspect;
    this.active = true;
    this.life = 24;
}

Projectile.prototype = {
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 152 + 8 * this.aspect, 0, 8, 8, this.x - 4, this.y - 4, 8, 8)
    },
    
    update: function() {
        this.life--;
        if (this.life == 0) {
            this.active = false;
            return;
        }
        var x = this.x;
        var y = this.y;
        
        for (var j = 0; j < Game.objects.length; j++) {
            var e = Game.objects[j]
            if (e instanceof Enemy) {
                if (((e.x - this.x) * (e.x - this.x) + (e.y - this.y) * (e.y - this.y)) < 128) {
                    e.hurt(this.aspect);
                    this.active = false;
                    break;
                }
            }
        }
        
        switch (this.direction) {
            case 0:
                this.move(0, 1);
                break;
            case 1:
                this.move(0, -1);
                break;
            case 2:
                this.move(-1, 0);
                break;
            case 3:
                this.move(1, 0);
                break;
        }
    },
    
    move: function(x, y) {
        var testx = this.x + x;
        var testy = this.y + y;
        if (testx < 8 || testy < 8 || testx >= 156 || testy >= 124) {
            this.active = false;
        } else if (!Game.isSolid(testx, testy, this)) {
            this.x = testx;
            this.y = testy;
        } else {
            this.active = false;
        }
    },
    
    collect: function() { ; }
}

function Explosion(x, y) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.animCountMax = 8;
    this.animCount = 0;
    this.frames = 7;
    this.frame = 0;
}

Explosion.prototype = {
    draw: function(ctx) {
        ctx.drawImage(gfx.objects, 128 + 16 * this.frame, 16, 16, 16, this.x - 8, this.y - 8, 16, 16)
    },
    
    update: function() {
        this.animCount++;
        if (this.animCount == this.animCountMax) {
            this.frame++;
            this.animCount = 0;
            if (this.frame == 8)
                this.active = false;
            else if (this.frame == 6)
                this.animCountMax = this.animCountMax + 2;
        }
    },
    
    collect: function() { ; }
}

function Block(invar) {
    this.type = invar[0];
    this.x = invar[1] * 16 + 8;
    this.y = invar[2] * 16 + 8;
    this.active = invar[3];
    this.invar = invar;
    
    if (this.type == 100) {
        // 4 way
        this.collide = function() {
            if (this.moveTimer == 0) {
                this.push(Game.player.direction)
            }
            return true;
        }
    } else if (this.type < 104) {
        this.aspect = this.type - 101;

        this.collide= function() {
            if (Game.player.aspect == this.aspect && this.moveTimer == 0) {
                this.push(Game.player.direction)
            }
            return true;
        }
    } else if (this.type == 104) {
        this.collide = function() {
            if (this.active && this.splitTimer == 0) {
                //this.invar[3] = false;
                Game.save();
                this.splitTimer = 8;
                //this.active = false;
            }
        }
    } else if (this.type == 105) {
        this.collide = function() {
            if (this.active) {
                Game.keys++;
                PlaySound("key");
                this.active = false;
                this.invar[3] = false;
            }
            return false;
        }
    } else if (this.type == 106) {
        this.collide = function() {
            if (this.active && this.splitTimer == 0) {
                if (Game.keys > 0) {
                    Game.keys--;
                    PlaySound("push");
                    this.invar[3] = false;
                    this.splitTimer = 8;
                }
            }
            return true;
        }
    } else if (this.type == 107) {
        this.draw = function(ctx) {
            ctx.drawImage(gfx.blocks, (7 - (Game.flipped ? 1 : 0)) * 16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
        }
        this.collide = function() { return this.contact(Game.player); }
        this.lastTouch = null;
        this.contact = function(caller) { 
            if (!caller)
                return;
            if ((Math.abs(caller.x - this.x) > 8) || (Math.abs(caller.y - this.y) > 8))
                return;
            if (this.lastTouch === null || this.lastTouch !== caller) {
                this.lastTouch = caller;
                Game.flipped = !(Game.flipped);
                this.lag = 16;
            }
            return false;
        }
        this.update = function() {
            if (this.lastTouch) {
                if ((Math.abs(this.lastTouch.x - this.x) > 8) || (Math.abs(this.lastTouch.y - this.y) > 8))
                    this.lastTouch = null;
            }
        }
    } else if (this.type == 108) {
        this.draw = function(ctx) {
            ctx.drawImage(gfx.blocks, (3 + (Game.flipped ? 5 : 0)) * 16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
        }
        this.collide = function() { return this.contact(Game.player); }
        this.contact = function(caller) { 
            return !(Game.flipped);
        }
    } else if (this.type == 109) {
        this.draw = function(ctx) {
            ctx.drawImage(gfx.blocks, (3 + (Game.flipped ? 0 : 5)) * 16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
        }
        this.collide = function() { return this.contact(Game.player); }
        this.contact = function(caller) { 
            return (Game.flipped);
        }
    }
}

Block.prototype = {
    draw: function(ctx) {
        if (this.splitTimer != 0) {
            ctx.drawImage(gfx.blocks, (9+(this.type-100)) * 16, 0, 8, 16, this.x - 8 - (8-this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(gfx.blocks, (9+(this.type-100)) * 16 + 8, 0, 8, 16, this.x + (8-this.splitTimer), this.y - 8, 8, 16)
        } else
            ctx.drawImage(gfx.blocks, (9 + (this.type-100)) * 16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
    },
    
    moveTimer: 0,
    dir: 0,
    lag: 0,
    splitTimer: 0,
    
    update: function () {
        if (this.moveTimer > 0) {
            if (this.lag == 0) {
                this.lag = 5;
                if (this.dir == 0)
                    this.y = this.y + 1;
                else if (this.dir == 1)
                    this.y = this.y - 1;
                else if (this.dir == 2)
                    this.x = this.x - 1;
                else if (this.dir == 3)
                    this.x = this.x + 1;
                //this.move(x, y);
                this.moveTimer--;
                if (this.moveTimer == 0)
                    this.pushCount = 0;
            }
            this.lag--;
        }
        if (this.splitTimer > 0) {
            if (this.lag == 0) {
                this.lag = 3;
                this.splitTimer--;
                if (this.splitTimer == 0)
                    this.active = false;
            }
            this.lag--;
        }
    },
    
    move: function(dir) {
        // Make sure the player only pushes the block they're aligned with
        if (Math.floor(this.x/16) !== Math.floor(Game.player.x/16) && Math.floor(this.y/16) !== Math.floor(Game.player.y/16)) {
            this.pushCount = 0
            return;
        }
        
        var x = this.x;
        var y = this.y;
        var delx = 0;
        var dely = 0;
        if (dir == 0)
            dely += 16;
        else if (dir == 1)
            dely += -16;
        else if (dir == 2)
            delx +=  -16;
        else if (dir == 3)
            delx += 16;
        
        if (!Game.isSolid(x + delx, y + dely, this) && (!Game.isSolid(x - delx, y - dely, this)) && (x+delx >= 8 && y+delx >= 8 && x+delx <= 152 && y+dely <= 120)) {
            PlaySound("push");
            this.moveTimer = 16;
            this.dir = dir;
        } else
            this.pushCount = 0;
    },
    
    pushCount: 0,
    
    push: function(dir) {
        this.pushCount++;
        if (this.pushCount == 6) {
            this.move(dir);
        }
    },
    
    collide: function() { this.active = false; return false; },
    contact: function(caller) { return true; }
};

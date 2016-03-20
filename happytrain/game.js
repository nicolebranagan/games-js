function Game() {

}

Game.score = 0;
Game.passengers = 0;
Game.maxpass = 0;

var GameStage = {
    RunMode: 0,
    DieMode: 1,
    WinMode: 2,
    PauseMode: 3,
}

// The activate function is called first and only once
Game.activate = function() {
    PlaySound("start");

    this.bgimage = new Image();
    this.bgimage.src = "./images/train_map.png";

    this.reset();
}

Game.reset = function() {
    document.getElementById('holderdiv').style.backgroundColor = "#000";
    this.player = new Player();
    this.player.image.src = "./images/player.png";
    this.shootLag = 0;
    this.lag = 0;
    this.phase = 0;
    this.passengers = 0;
    Game.score = 0;

    worldfile.forEach(function(e1, i) {
        if (e1 != 0) {
            e1.objects.forEach(function(e2, j) {
                e2[3] = true;
            });
        }
    });

    this.mode = GameStage.RunMode;
    this.loadroom(0, 0);
}

Game.loadroom = function(x, y) {
    this.x = x
    this.y = y
    this.tileMap = worldfile[x + y * 6].tiles

    this.objects = new Array();
    objects = worldfile[x + y * 6].objects;
    objects.forEach(function(item, index, array) {
        if (item[0] == 0) {
            Game.objects.push(
                getEnemy(item[1] * 16 + 8, item[2] * 16 + 8));
        } else {
            Game.objects.push(new Stationary(item));
        }
    });

    if (this.phase == 1 && x == 0 && y == 0)
        Game.objects.push(new Stationary([4, 2, 2, true]));
}

Game.tryloadroom = function(x, y) {
    if (x < 0 || y < 0 || x >= 6 || y >= 6)
        return false;
    if (worldfile[x + y * 6] == 0)
        return false;
    this.loadroom(x, y)
    return true;
}

// The update function is called first
Game.update = function() {
    if (this.mode == GameStage.RunMode) {
        if (Controls.Enter) {
            this.lag = 20;
            Controls.Enter = false;
            this.mode = GameStage.PauseMode;
        }
        if (Controls.Up) {
            this.player.moving = true;
            this.player.direction = 1;
        } else if (Controls.Down) {
            this.player.moving = true;
            this.player.direction = 0;
        } else if (Controls.Left) {
            this.player.moving = true;
            this.player.direction = 2;
        } else if (Controls.Right) {
            this.player.moving = true;
            this.player.direction = 3;
        }
        if (this.shootLag <= 0) {
            if (Controls.Shoot) {
                this.shootLag = 50;
                PlaySound("whistle");
                /*this.projectiles.push(new Projectile(this.player.x, this.player.y, this.player.direction));*/
            }
        } else
            this.shootLag = this.shootLag - 1;

        this.player.update();

        this.objects.forEach(function(e) {
            e.update()
            if (e.active == false) {
                var index = Game.objects.indexOf(e);
                Game.objects.splice(index, 1);
            } else if (Math.pow(e.x - Game.player.x, 2) + Math.pow(e.y - Game.player.y, 2) < 100) {
                /*Game.mode = GameStage.DieMode;
                Game.animCount = 255;*/
                e.collect()
            }
        });

        if (this.phase == 0 && this.passengers == this.maxpass) {
            this.phase = 1;
        }
    } else if (this.mode == GameStage.DieMode || this.mode == GameStage.WinMode) {
        this.animCount = this.animCount - 2;
        if (this.animCount <= 0) {
            if (this.mode == GameStage.DieMode)
                this.reset();
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
            }
        }
    }
}

// The draw function takes the context of the gamecanvas as a parameter
Game.draw = function(ctx) {
    ctx.imageSmoothingEnabled = false
    this.drawRoom(ctx);
    //if (this.mode == GameStage.RunMode) {
    ctx.globalAlpha = 1.0;
    /*}
    else if (this.mode != GameStage.PauseMode) {
    	ctx.globalAlpha = this.animCount / 255;
    }*/
    if (this.mode != GameStage.PauseMode) {
        this.player.draw(ctx);
        this.objects.forEach(function(e) {
            e.draw(ctx)
        });
    }
    if (this.mode == GameStage.WinMode) {
        this.player.draw(ctx);
    }
}

Game.drawRoom = function(ctx) {
        var i = 0;
        for (var y = 0; y < 12; y++) {
            for (var x = 0; x < 20; x++) {
                if (this.tileMap[i] != 0)
                    ctx.drawImage(this.bgimage, 16 * this.tileMap[i], 0, 16, 16, x * 16, y * 16, 16, 16);
                i++;
            }
        }
    }
    // Functions regarding the map

Game.isSolid = function(x, y) {
    var i = Math.floor(x / 16) + 20 * Math.floor(y / 16);
    return this.tileMap[i] != 0;
}

Game.getTile = function(x, y) {
    var i = Math.floor(x / 16) + 20 * Math.floor(y / 16);
    return this.tileMap[i];
}

Game.squareSolid = function(x, y) {
    // Checks whether a square centered at loc is at all solid
    return Game.isSolid(x, y - 6) || Game.isSolid(x, y + 6) ||
        Game.isSolid(x - 6, y) || Game.isSolid(x + 6, y) ||
        Game.isSolid(x - 6, y - 6) || Game.isSolid(x - 6, y + 6) ||
        Game.isSolid(x + 6, y - 6) || Game.isSolid(x + 6, y + 6);
}

// GameObject
function GameObject() {
    this.active = true;
    this.x = 40;
    this.y = 40;
    this.currentFrame = 0;
    this.stallCount = 0;
    this.moving = false;
    this.direction = 0;
    this.image = new Image();
}

GameObject.prototype = {
    speed: 2,

    stallCountMax: 10,

    offset: 0,

    draw: function(ctx) {
        // Slice image
        ctx.drawImage(this.image, 16 * (2 * this.direction + this.currentFrame + this.offset), 0 * 16, 16, 16, this.x - 8, this.y - 8, 16, 16);
    },

    _update: function() {
        this.stallCount = this.stallCount + 1;
        if (this.stallCount == this.stallCountMax) {
            this.stallCount = 0;
        }
        if (this.stallCount == 0) {
            this.currentFrame = (this.currentFrame + 1) % 2;
            if (!this.moving) this.currentFrame = 0;
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
        if (testx < 8 || testy < 8 || testx >= 314 || testy >= 186) {
            this.boundscheck(testx, testy)
        } else if (!Game.squareSolid(testx, testy)) {
            this.x = testx;
            this.y = testy;
        }

        var tile = Game.getTile(this.x, this.y);
    },

    collect: function() {}
}

function Player() {}
Player.prototype = new GameObject();
Player.prototype.stallCountMax = 20;
Player.prototype.boundscheck = function(x, y) {
    var delx = 0
    var dely = 0
    if (x < 8)
        delx = -1
    else if (y < 8)
        dely = -1
    else if (x >= 314)
        delx = 1
    else if (y >= 186)
        dely = 1

    if (Game.tryloadroom(Game.x + delx, Game.y + dely)) {
        if (delx == -1)
            this.x = 314
        else if (delx == 1)
            this.x = 8
        else if (dely == -1)
            this.y = 186
        else if (dely == 1)
            this.y = 8
    }
}

function Enemy() {}
Enemy.prototype = new GameObject();
Enemy.prototype.image.src = "./images/bigmouse.png";
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
            } else
                faceDir = getRandomInt(0, 4);
        }
    }
};
Enemy.prototype.collect = function() {
    Game.mode = GameStage.DieMode;
    Game.animCount = 512;
    PlaySound("die");
}

getEnemy = function(x, y) {
    var enemy = new Enemy();
    enemy.x = x;
    enemy.y = y;
    if (Game.phase == 1) {
        enemy.speed = 3;
        enemy.offset = 8;
    }
    return enemy;
}

var StationaryImage = new Image();
StationaryImage.src = "./images/objects.png";

function Stationary(invar) {
    type = invar[0];
    x = invar[1] * 16 + 8;
    y = invar[2] * 16 + 8;
    this.active = invar[3];
    this.list = invar;
    this.image = StationaryImage;

    this.currentFrame = 0;
    this.animCountMax = 25;
    this.animCount = this.animCountMax;

    this.x = x;
    this.y = y;
    this.type = type;
    if (this.type == 1) {
        // Passenger
        this.column = 4 + (Math.round(Math.random()) * 2);
        this.frames = 2;
        this.collect = function() {
            Game.passengers++;
            this.active = false;
            this.list[3] = false;
            PlaySound("pax");
            Game.score = Game.score + 250;
        };
    } else if (this.type == 4) {
        // Win condition
        this.column = 8;
        this.frames = 3;
        this.collect = function() {
            Game.mode = GameStage.WinMode;
            Game.animCount = 512;
            PlaySound("win");
        };
    } else {
        // Money
        if (this.type == 2) {
            // Cent coin
            this.value = 500;
            this.column = 2;
            this.sound = "cent"
        } else {
            // Dollar coin
            this.value = 1000;
            this.column = 0;
            this.sound = "dollar"
        }
        this.frames = 2;
        this.collect = function() {
            this.active = false;
            this.list[3] = false;
            Game.score = Game.score + this.value;
            PlaySound(this.sound);
        }
    }
}

Stationary.prototype = {
    draw: function(ctx) {
        if (this.active) {
            ctx.drawImage(this.image, (this.column + this.currentFrame) * 16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
        }
    },

    update: function() {
        this.animCount--;
        if (this.animCount == 0) {
            this.currentFrame++;
            this.currentFrame = this.currentFrame % this.frames;
            this.animCount = this.animCountMax;
        }
    }
}
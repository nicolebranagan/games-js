"use strict";

// Arbitrary objects

var Arbitrary = function(invar) {
    if (invar[0] == 200) {
        Game.objects.push(new arbKillAll(invar, 105));
    } else if (invar[0] == 201) {
        Game.blocks.push(new wideDoor(invar, true));
    } else if (invar[0] == 202) {
        Game.blocks.push(new wideDoor(invar, false));
    } else if (invar[0] == 203) {
        Game.objects.push(getTalkOnEnter(invar, ["I found myself lost in this strange cave.", "I don't remember how I got here, I don't remember who I am...", "What happened?"]));
    } else if (invar[0] == 204) {
        Game.objects.push(getTalker(invar, 1, ["\"Meow!\"", "Talking to the cat reminds me of something.", "Three symbols, but why and what is their purpose?"], true));
    } else if (invar[0] == 205) {
        var runner = getRunner(invar, 1, ["\"Meow!\"", "I realized that this strange symbol will allow me to restore my progress.", "But did I realize it, or did the cat tell me?"], 2);
        runner.direction = 3;
        Game.objects.push(runner);
    } else if (invar[0] == 206) {
        var runner = getRunner(invar, 1, ["\"Meow!\"", "I get the impression this cat knows more than it's saying."], 2);
        runner.direction = 1;
        Game.objects.push(runner);
    } else if (invar[0] == 207) {
        var crys = getCrystal(invar);
        crys.collide = function() {
            if (this.invar[3]) {
                Game.textBox(["This crystal! I don't know the meaning of this, but I know it's important!", "I don't know why, but I get the impression that if I find more of these, it might restore my memory.", "...or at least it will give me something to do."]);
                this._collide();
            }
        }
        Game.blocks.push(crys);
    } else if (invar[0] == 208) {
        var talker = getTalker(invar, 2, ["Everyone in this town turned to stone one day.", "...", "Of course we had nothing to do with it!"], false);
        talker.direction = 3;
        Game.objects.push(talker);
    } else if (invar[0] == 209) {
        var talker = getTalker(invar, 2, ["The cult of the god-empress is trying to investigate matters here.", "Our leader has set up camp in the southern part of the town."], false);
        Game.objects.push(talker);
    } else if (invar[0] == 210) {
        if (Game.crystals > 2)
            return;
        var talker = getTalker(invar, 2, ["The bridge to the southern part of the town has collapsed!", "And I'm certainly not going to get my robe wet!"], false);
        talker.direction = 3;
        Game.objects.push(talker);
    } else if (invar[0] == 211) {
        Game.blocks.push(getDoor(invar, function() { 
            if (Game.crystals < 2) {
                Game.textBox(["This door... I think it's tied to the crystals somehow!", "Perhaps if I get enough crystals, it'll open."]);
            } else {
                this.open();
            }
        }));
    } else if (invar[0] == 212) {
        var talker = getTalker(invar, 2, ["These poor imperial guards...", "I'd say I feel bad for their families, but I believe they're cloned from birth now."], false);
        talker.direction = 1;
        Game.objects.push(talker);
    } else if (invar[0] == 213) {
        var talker = getTalker(invar, 2, ["Before the town was destroyed, the people secretly developed submarine technology.", "Maybe this tragedy was a punishment from the god-empress for their sins?"], false);
        talker.direction = 2;
        Game.objects.push(talker);
    } else if (invar[0] == 214) {
        var crys = getCrystal(invar);
        crys.collide = function() {
            if (this.invar[3]) {
                Game.textBox(["This crystal looks like it's being used as a power source!", "Well, they're certainly not using it."]);
                this._collide();
            }
        }
        Game.blocks.push(crys);
    } else if (invar[0] == 215) {
        var runner = getRunner(invar, 1, ["\"Meow!\"", "I almost get the impression the cat is in my thoughts, but I push that idea away."], 2);
        runner.direction = 3;
        Game.objects.push(runner);
    } else if (invar[0] == 216) {
        var runner = getRunner(invar, 1, ["[Hello sister]", "I push the voice out of my head.", "And yet the cat seems so familiar..."], 2);
        runner.direction = 3;
        Game.objects.push(runner);
    } else if (invar[0] == 217) {
        var talker = getTalker(invar, 2, ["It's happening to us now!", "He was my best friend...", "...", "...or was it she?"], false);
        talker.direction = 3;
        Game.objects.push(talker);
    } else if (invar[0] == 218) {
        if (Game.crystals > 3)
            return;
        var talker = getTalker(invar, 3, ["I am Miranda, leader of the cult of the god-empress.", 
        "You seem familiar to me.",
        "I will tell you a secret. The Princess Mary, our beloved god-empress, has disappeared, and taken Nicole with her.",
        "I have caused this incident to distract my cult, but I worry now if I have done the right thing.",
        "Take this crystal, and with it, my hope."], false);
        talker.say = function() {
            Game.textBox(this.text);
            if (Game.crystals == 2) 
            {
                Game.crystals++;
                this.lag = 3;
            }
        }
        talker.lag = 0;
        talker.__update = talker.update;
        talker.update = function() {
            this.__update();
            if (this.lag > 0) {
                this.lag--;
                if (this.lag == 0)
                    PlaySound("crystal");
            }
            if (Game.crystals === 3)
                this.text = ["Hurry, young cat-eared one.", "Perhaps you should examine the abandoned garrison to the south."];            
        } 
        talker.direction = 1;
        Game.objects.push(talker);
    } else if (invar[0] == 219) {
        var talker2 = getTalker(invar, 2, ["Miranda is incredibly wise!"], false);
        if (Game.crystals > 3)
            talker2.text = ["Miranda has disappeared.", "But she's so wise she probably had a good reason!"];
        talker2.direction = 2;
        Game.objects.push(talker2);
    } else if (invar[0] == 220) {
        var talker1 = getTalker(invar, 2, ["Miranda trusts you for some reason."], false);
        if (Game.crystals > 3)
            talker1.text = ["I wish we had chairs, but alas they are anathema."]
        talker1.direction = 3;
        Game.objects.push(talker1);
    } else if (invar[0] == 222) {
        var talker = getTalker(invar, 2, ["This town was probably once a nice place to have a vacation!"], false);
        talker.direction = 2;
        Game.objects.push(talker);
    } else if (invar[0] == 223) {
        Game.blocks.push(getDoor(invar, function() { 
            if (Game.crystals < 3) {
                Game.textBox(["Another door...", "Perhaps I should explore the town a bit more."]);
            } else {
                this.open();
            }
        }));
    } else if (invar[0] == 224) {
        var runner = getRunner(invar, 1, ["\"Meow!\"", "[We don't have much time!]", "I'm still not sure who I am, but I desperately hope I'm not the type of person who talks to cats."], 3);
        runner.direction = 2;
        Game.objects.push(runner);
    } else if (invar[0] == 225) {
       var crys = getCrystal(invar);
        crys.collide = function() {
            if (this.invar[3]) {
                this._collide();
            }
        }
        Game.blocks.push(crys);
    } else if (invar[0] == 226) {
        Game.blocks.push(getDoor(invar, function() { 
            if (Game.crystals < 5) {
                Game.textBox(["Seriously, who keeps putting these doors here?", "Looks like I'll need five crystals this time."]);
            } else {
                this.open();
            }
        }));
    } else if (invar[0] == 227) {
        var talker = getTalker(invar, 4, ["A broomstick?"], false);
        talker.talkLag = 0;
        talker.___update = talker.update;
        talker._say = talker.say;
        talker.say = function() { talker._say(); if (Game.spoken_to) talker.talkLag = 3;}
        talker.update = function() {
            this.___update();
            if (Game.spoken_to)
                this.text = ["If I get on this broom, I could fly across the ocean to the palace...", "But I don't think I like water...", "I am a catgirl after all.", "[Stop wasting time and let's go!]"];
            if (this.talkLag != 0) {
                this.talkLag--;
                if (this.talkLag == 0)
                    window.runner = new Subgame();
            }
        };
        talker.stallCountMax = 30;
        Game.objects.push(talker);
    } else if (invar[0] == 228) {
        // Build a bridge
        if (Game.crystals > 2) {
            Game.tileMap = Game.tileMap.slice(0);
            Game.tileMap[10*6 + 4] = 23;
            Game.tileMap[10*5 + 3] = 43;
        }
    } else if (invar[0] == 229) {
        if (Game.spoken_to)
            return;
        Game.spoken_to = false;
        var talker = getTalker(invar, 1, ["\"Meow!\"", "[There's no time to explain", "You need to get to the imperial palace, take me with you]", "...", "What else can I do? I guess I'm following the advice of a cat."], false);
        talker._say = talker.say;
        talker.direction = 0;
        talker.say = function() {this._say(); Game.spoken_to = true; this.text = ["\"Meow!\""]};
        Game.objects.push(talker);
    } else if (invar[0] == 230) {
        var runner = getRunner(invar, 1, ["Meow!"], 0);
        runner.timer = 2;
        runner.direction = 2;
        Game.objects.push(runner);
        Game.objects.push(getTalkOnEnter(invar, ["[The imperial palace... it's been too long.]","\"Hey, it's time you started to explain things to me!\"", "[It's time you realized there's no time!]", "\"Just tell me who you are!\"", "[Didn't you know? I'm Nicole!", "And, well, so are you...", "But we're low on time!]"]));
    } else if (invar[0] == 231) {
        Game.objects.push(new stallDoor(invar, false, function() {
            return (Math.floor(Game.player.x / 16) == 3) && 
                    (Math.floor(Game.player.y / 16) == 5)
        }, false));
    } else if (invar[0] == 232) {
        Game.objects.push(new blockDoor(invar, true, 71, 64));
    } else if (invar[0] == 233) {
        invar = invar.slice(0);
        invar[0] = 100;
        var block = new Block(invar);
        block.type = 169;
        Game.blocks.push(block);
    } else if (invar[0] == 300) {
        Game.blocks.push(floorTile(invar));
    } else if (invar[0] == 301) {
        Game.objects.push(new blockDoor(invar, true));
    } else if (invar[0] == 302) {
        Game.objects.push(new blockDoor(invar, false));
    } else if (invar[0] == 303) {
        Game.objects.push(new stallDoor(invar, false, function() {return (Game.player.x < (8*16 + 8))}, true));
    } else if (invar[0] == 304) {
        Game.blocks.push(floorTile(invar, true));
    }
}

var arbKillAll = function(invar, reward) {
    this.invar = invar;
    this.active = invar[3];
    this.x = -1;
    this.y = -1;
    this.aspect = -1;
    this.reward = [reward, invar[1], invar[2], true];
}

arbKillAll.prototype = {
    draw: function(ctx) { ; },
    
    collect: function() { ; },
    
    needKey: false,
    
    update: function() {
        if (this.active && !this.needKey) {
            if (this.check()) {
                PlaySound("appear");
                Game.blocks.push(new Block(this.reward));
                this.needKey = true;
            }
        } else if (this.active && this.needKey) {
            if (this.check2()) {
                this.active = false;
                this.invar[3] = false;
            }
        }
    },
    
    objects: [],
    
    check: function() {
        for (var i=0; i < Game.objects.length; i++) {
            var obj = Game.objects[i];
            if (obj instanceof Enemy) {
                this.objects = Game.objects.slice(0);
                return false;
            }
        }
        var lastobj = Game.objects.compare(this.objects);
        if (lastobj) {
            this.reward[1] = Math.floor(lastobj.x / 16);
            this.reward[2] = Math.floor(lastobj.y / 16);
        }
        return true;
    },
    
    check2: function() {
        for (var i=0; i < Game.blocks.length; i++) {
            var block = Game.blocks[i];
            if (block.invar == this.reward)
                return false;
        }
        return true;
    },
}

var dummyBlock = function(x, y, master) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.master = master;
}

dummyBlock.prototype = {
    draw: function(ctx) { ; },
    
    collide: function() { return this.master.collide(); },
    
    update: function() { ; }
}

var wideDoor = function(invar, horz, centerpiece, sidepiece, hidden) {
    this.invar = invar;
    this.x = invar[1] * 16 + 8;
    this.y = invar[2] * 16 + 8;
    this.horz = horz;
    this.active = invar[3];
    this.hidden = hidden ? true : false;
    if (centerpiece)
        this.centerpiece = centerpiece;
    else
        this.centerpiece = 15;
    if (sidepiece)
        this.sidepiece = sidepiece;
    else
        this.sidepiece = 3;
    if (this.active) {
        // Build dummy object
        var dummyX = this.x;
        var dummyY = this.y;
        if (this.horz) { dummyX = dummyX + 16; }
        else { dummyY = dummyY + 16; }
        this.dummy = new dummyBlock(dummyX, dummyY, this);
        Game.blocks.push(this.dummy);
    }
}

wideDoor.prototype = {
    splitTimer: 16,
    
    draw: function(ctx) {
        if (this.hidden && this.splitTimer == 16)
            return;
        if (this.horz) {
            ctx.drawImage(gfx.blocks, (this.sidepiece)*16, 0, 8, 16, this.x - 8 - (16 - this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(gfx.blocks, (this.centerpiece)*16, 0, 8, 16, this.x - (16 - this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(gfx.blocks, (this.centerpiece)*16 + 8, 0, 8, 16, this.x + 8 + (16 - this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(gfx.blocks, (this.sidepiece)*16 + 8, 0, 8, 16, this.x + 16 + (16 - this.splitTimer), this.y - 8, 8, 16)
        } else {
            ctx.drawImage(gfx.blocks, (this.sidepiece)*16, 0, 16, 8, this.x - 8, this.y - 8 - (16 - this.splitTimer), 16, 8)
            ctx.drawImage(gfx.blocks, (this.centerpiece)*16, 0, 16, 8, this.x - 8, this.y - (16 - this.splitTimer), 16, 8)
            ctx.drawImage(gfx.blocks, (this.centerpiece)*16, 8, 16, 8, this.x - 8, this.y + 8 + (16 - this.splitTimer), 16, 8)
            ctx.drawImage(gfx.blocks, (this.sidepiece)*16, 8, 16, 8, this.x - 8, this.y + 16 + (16 - this.splitTimer), 16, 8)
        }
    },
    
    lag: 5,
    
    update: function() { 
        if (this.splitTimer < 16){
            this.lag--;
            if (this.lag == 0) {
                this.splitTimer--;
                this.lag = 5;
                if (this.splitTimer < 0) {
                    this.dummy.active = false;
                    this.active = false;
                }
            }
        } else if (this.splitTimer > 16) {
            this.lag--;
            if (this.lag == 0) {
                this.splitTimer--;
                this.lag = 2;
            }
        }
    },
    
    collide: function() { 
        if (this.active && this.splitTimer == 16) {
            if (Game.keys > 0) {
                this.open();
                Game.keys--;
            }
        }
        return true;
    },
    
    contact: function(caller) {
        return true;
    },
    
    open: function() {
        PlaySound("push");
        this.invar[3] = false;
        this.splitTimer = 15;
    }
}

var getTalker = function(invar, row, text, disappear) {
    var talker = new GameObject();
    talker.x = invar[1] * 16 + 8;
    talker.y = invar[2] * 16 + 8;
    talker.disappear = disappear;
    talker.invar = invar;
    talker.active = invar[3];
    talker.row = row;
    talker.aspect = -1;
    talker.text = text;
    talker.animate = true;
    talker.collect = function() { Game.player.recoil(); }
    talker.speak = function() { 
        switch (Game.player.direction) {
            case 0:
                this.direction = 1;
                break;
            case 1:
                this.direction = 0;
                break;
            case 2:
                this.direction = 3;
                break;
            case 3:
                this.direction = 2;
                break;
        }
        if (this.disappear) {
            this.invar[3] = false;
        }
        this.say();
    };
    talker.say = function() { Game.textBox(this.text); };
    return talker;
}

var getTalkOnEnter = function(invar, text) {
    var talker = new GameObject();
    talker.x = 0;
    talker.y = 0;
    talker.invar = invar;
    talker.row = -1;
    talker.aspect = -1;
    talker.text = text;
    talker.update = function() {
        if (this.invar[3]) {
            Game.textBox(text);
            this.invar[3] = false;
            this.active = false;
            }
    };
    return talker;
}

var getRunner = function(invar, row, text, rundir) {
    var runner = getTalker(invar, row, text, false);
    runner._speak = runner.speak;
    runner.running = false;
    runner.speed = 2;
    runner.timer = 3;
    runner.rundir = rundir;
    runner.speak = function() {
        if (!this.moving) {
            this._speak();
            this.timer = 2;
        }
    }
    runner.update = function() {
        if (!this.moving && this.timer < 3) {
            this.timer--;
            if (this.timer == 0) {
                this.direction = this.rundir;
                this.moving = true;
            }
        }
        this._update();
    }
    runner.boundscheck = function() {
        this.active = false;
        this.invar[3] = false;
    }
    return runner;
}

var getCrystal = function(invar) {
    var crystal = new Block(invar);
    crystal.drawCount = 0;
    crystal.draw = function(ctx) {
        ctx.drawImage(gfx.objects, 10 * 16, (2+this.drawCount) * 16, 16, 16, this.x - 8, this.y - 8, 16, 16);
    }
    crystal.update = function() {
        if (!this.active)
            return;
        if (this.lag == 0) {
            this.drawCount++;
            if (this.drawCount == 4) this.drawCount = 0;
            this.lag = 15;
            if (this.invar[3] == false) {
                PlaySound("crystal");
                this.active = false;
            }
        }
        else
            this.lag--;
    }
    crystal._collide = function() {
        if (this.invar[3]) {
            Game.crystals++;
            this.invar[3] = false;
            this.lag = 3;
        }
    }
    crystal.collide = function() {
        if (this.active)
            this._collide;
    }
    return crystal;
}

var getDoor = function(invar, onhit) {
    var door = new Block(invar);
    door.drawCount = 0;
    door.draw = function(ctx) {
        ctx.drawImage(gfx.objects, 8 * 16, (2+this.drawCount) * 16, 32, 16, this.x - 16, this.y - 8, 32, 16);
    }
    door.lag = -1;
    door.update = function() {
        if (this.lag == 0) {
            this.drawCount++;
            this.lag = 5;
            if (this.drawCount == 6) {
                this.active = false;
                //this.invar[3] = false;
            }
        }
        else if (this.lag > 0)
            this.lag--;
    }
    door.onhit = onhit;
    door.collide = function() {
        if (this.lag == -1)
            this.onhit();
    }
    door.open = function() {
        // Open after condition is met
        this.lag = 0;
    }
    return door;
};

var floorTile = function(invar, hidden) {
    var block = new Block(invar);
    block.floorTile = true;
    block.active = true;
    block.animCount = 0;
    block.frame = 0;
    block.draw = function(ctx) {
        if (hidden)
            return;
        if (this.animCount == 10) {
            this.animCount = 0;
            this.frame++
            if (this.frame == 6)
                this.frame = 0;
        } else {
            this.animCount++;
        }
        ctx.drawImage(gfx.blocks, (26 + this.frame) * 16, 0, 16, 16, this.x - 8, this.y - 8, 16, 16);
    };
    block.collide = function() { return false; };
    block.contact = function(caller) { return false; };
    return block;
};

var blockDoor = function(invar, horz, hidden, under) {
    this.invar = invar;
    this.horz = horz;
    this.timer = 0;
    this.blocks = [];
    this.tiles = [];
    this.active = this.invar[3];
    if (hidden) {
        this.hidden = hidden;
        this.under = under;
    }
    else
        this.hidden = false;

    if (this.invar[3]) {
        var door;
        if (this.hidden)
            door = new wideDoor(invar, horz, hidden, hidden, true);
        else
            door = new wideDoor(invar, horz, 3);
        door.collide = door.contact;
        Game.blocks.push(door);
        this.door = door;
    } else if (this.hidden) {
        Game.tileMap = Game.tileMap.slice(0);
        Game.tileMap[this.invar[1] + this.invar[2]*10] = this.under;
        if (this.horz) {
            Game.tileMap[this.invar[1] + this.invar[2]*10 + 1] = this.under;
        } else {
            Game.tileMap[this.invar[1] + this.invar[2]*10 + 10] = this.under;
        }
    }
};

blockDoor.prototype = {
    governor: function() {
        for (var i = 0; i < Game.blocks.length; i++) {
            var b = Game.blocks[i];
            if (b.floorTile) {
                this.tiles.push(b);
            } else if (b instanceof Block) {
                this.blocks.push(b);
            }
        }
    },
    
    collect: function() { ; },
    
    draw: function(ctx) { ; },
    
    update: function() {
        if (!this.active)
            return;
        if (this.timer < 2) {
            this.timer++;
            if (this.timer == 2)
                this.governor();
            else
                return;
        }
        for (var i = 0; i < this.tiles.length; i++) {
            var t = this.tiles[i];
            var tx = Math.floor(t.x / 16);
            var ty = Math.floor(t.y / 16);
            var covered = false;
            for (var j = 0; j < this.blocks.length; j++) {
                var b = this.blocks[j];
                var bx = Math.floor(b.x / 16);
                var by = Math.floor(b.y / 16);
                if (tx == bx && ty == by) {
                    covered = true;
                    break;
                }
            }
            if (!covered)
                return;
        }
        if (this.hidden) {
            Game.tileMap = Game.tileMap.slice(0);
            Game.tileMap[this.invar[1] + this.invar[2]*10] = this.under;
            if (this.horz) {
                Game.tileMap[this.invar[1] + this.invar[2]*10 + 1] = this.under;
            } else {
                Game.tileMap[this.invar[1] + this.invar[2]*10 + 10] = this.under;
            }
        }
        this.door.open()
        PlaySound("appear");
        this.active = false;
        this.invar[3] = false;
    }
};

var stallDoor = function(invar, horz, condition, block) {
    this.condition = condition;
    this.horz = horz;
    this.invar = invar;
    this.block = block;
}

stallDoor.prototype = {
    collect: function() { ; },
    
    draw: function(ctx) { ; },
    
    update: function() {
        if (!this.invar[3])
            this.active = false;
        if (this.condition()) {
            this.activate();
            this.active = false;
        }
    },
    
    activate: function() {
        PlaySound("push");
        var door;
        if (this.block) {
            door.door.splitTimer = 48;
            door = new blockDoor(this.invar, this.horz);
        }
        else {
            door = new wideDoor(this.invar, this.horz);
            door.splitTimer = 48;
        }
        Game.blocks.push(door);
    }
}

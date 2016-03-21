// Arbitrary objects

Arbitrary = function(invar) {
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
    }
}

arbKillAll = function(invar, reward) {
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
    
    check: function() {
        for (var i=0; i < Game.objects.length; i++) {
            var obj = Game.objects[i];
            if (obj instanceof Enemy)
                return false;
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

dummyBlock = function(x, y, master) {
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

wideDoor = function(invar, horz) {
    this.invar = invar;
    this.x = invar[1] * 16 + 8;
    this.y = invar[2] * 16 + 8;
    this.horz = horz;
    this.active = invar[3];
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
        if (this.horz) {
            ctx.drawImage(Game.bgimage, 3*16, 0, 8, 16, this.x - 8 - (16 - this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(Game.bgimage, 15*16, 0, 8, 16, this.x - (16 - this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(Game.bgimage, 15*16 + 8, 0, 8, 16, this.x + 8 + (16 - this.splitTimer), this.y - 8, 8, 16)
            ctx.drawImage(Game.bgimage, 3*16 + 8, 0, 8, 16, this.x + 16 + (16 - this.splitTimer), this.y - 8, 8, 16)
        } else {
            ctx.drawImage(Game.bgimage, 3*16, 0, 16, 8, this.x - 8, this.y - 8 - (16 - this.splitTimer), 16, 8)
            ctx.drawImage(Game.bgimage, 15*16, 0, 16, 8, this.x - 8, this.y - (16 - this.splitTimer), 16, 8)
            ctx.drawImage(Game.bgimage, 15*16, 8, 16, 8, this.x - 8, this.y + 8 + (16 - this.splitTimer), 16, 8)
            ctx.drawImage(Game.bgimage, 3*16, 8, 16, 8, this.x - 8, this.y + 16 + (16 - this.splitTimer), 16, 8)
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
        }
    },
    
    collide: function() { 
        if (this.active && this.splitTimer == 16) {
            if (Game.keys > 0) {
                Game.keys--;
                this.invar[3] = false;
                this.splitTimer = 15;
            }
        }
        return true;
    }
}

getTalker = function(invar, row, text, disappear) {
    talker = new GameObject();
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
        Game.textBox(this.text); 
    };
    return talker;
}

getTalkOnEnter = function(invar, text) {
    talker = new GameObject();
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

getRunner = function(invar, row, text, rundir) {
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
        console.log("bounds");
        this.active = false;
        this.invar[3] = false;
    }
    return runner;
}

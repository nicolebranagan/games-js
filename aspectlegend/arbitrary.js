// Arbitrary objects

Arbitrary = function(invar) {
    if (invar[0] == 200) {
        Game.objects.push(new arbKillAll(invar, 105));
    } else if (invar[0] == 201) {
        Game.blocks.push(new wideDoor(invar, true));
    } else if (invar[0] == 202) {
        Game.blocks.push(new wideDoor(invar, false));
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
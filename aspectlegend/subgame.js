var Subgame = function() {
}

Subgame.prototype = {
    timer: 0,
    
    update: function() {
        this.timer++;
    },
    
    draw: function(ctx) {
        var water = 76;
        var offset = Math.floor((this.timer/2)) % 16;
        var i = 0;
        for (var y = -1; y < 8; y++) {
            for (var x = 0; x < 10; x++) {
                ctx.drawImage(Game.bgimage, 16 * water, 0, 16, 16, x * 16, y * 16 + offset, 16, 16);
                i++;
            }
        };
        ctx.clearRect(0, gamecanvas.height-16, gamecanvas.width, 16);
        Game.drawUI(ctx);
    },
}
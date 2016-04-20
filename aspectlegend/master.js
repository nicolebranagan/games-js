var gamecanvas = document.getElementById('gamecanvas');
var gamecontrols = document.getElementById('gamecontrols');
var runner = LogoScreen;
var __debug = false;

var Titleimage = new Image();
Titleimage.src = "./images/title.png";

var Logo = new Image();
Logo.src = "./images/logo.png";

var Font = new Image();
Font.src = "./images/cgafont.png";

function Loop() {
    setTimeout(Loop, 500 / 60);
    ctx = gamecanvas.getContext("2d");
    ctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
    runner.update();
    runner.draw(ctx);
};

var Controls = {
    Up: false,
    Down: false,
    Left: false,
    Right: false,
    Shoot: false,
    Enter: false,

    keyDown: function(event) {
        if (event.keyCode == 32) { // SPACE
            Controls.Shoot = true;
        }
        if (event.keyCode == 38 || event.keyCode == 87) {
            Controls.Up = true;
        }
        if (event.keyCode == 40 || event.keyCode == 83) {
            Controls.Down = true;
        }
        if (event.keyCode == 37 || event.keyCode == 65) {
            Controls.Left = true;
        }
        if (event.keyCode == 39 || event.keyCode == 68) {
            Controls.Right = true;
        }
        if (event.keyCode == 13) {
            Controls.Enter = true;
        }
    },

    keyUp: function(event) {
        if (event.keyCode == 32) { // SPACE
            Controls.Shoot = false;
        }
        if (event.keyCode == 38 || event.keyCode == 87) {
            Controls.Up = false;
        }
        if (event.keyCode == 40 || event.keyCode == 83) {
            Controls.Down = false;
        }
        if (event.keyCode == 37 || event.keyCode == 65) {
            Controls.Left = false;
        }
        if (event.keyCode == 39 || event.keyCode == 68) {
            Controls.Right = false;
        }
        if (event.keyCode == 13) {
            Controls.Enter = false;
        }
        if (event.keyCode == 9) {
            var image = gamecanvas.toDataURL("image/png");
            window.open(image, '_blank');
        }
    },
    
    touchActive: false,

    touchStart: function(events) {
        if (!this.touchActive) {
            document.getElementById('holderdiv2').innerHTML = "";
            Controls.enter = true;
            gamecontrols.style.display = "block";
            this.touchActive = true;
        }
        for (var i = 0; i < events.touches.length; i++) {
            touch = events.touches[i];
            var posx = Math.round(96 * (touch.pageX - gamecontrols.offsetLeft) / gamecontrols.width);
            var posy = Math.round(40 * (touch.pageY - gamecontrols.offsetTop) / gamecontrols.height);

            if (inRectangle(posx, posy, 14, 6, 12, 10)) Controls.Up = true;
            if (inRectangle(posx, posy, 14, 24, 12, 10)) Controls.Down = true;
            if (inRectangle(posx, posy, 5, 14, 10, 12)) Controls.Left = true;
            if (inRectangle(posx, posy, 25, 14, 10, 12)) Controls.Right = true;
            if (inRectangle(posx, posy, 39, 11, 24, 20)) Controls.Enter = true;
            if (inRectangle(posx, posy, 67, 7, 18, 25)) Controls.Shoot = true;
        }
    },
    
    touchEnd: function(events) {
        Controls.Up = false;
        Controls.Down = false;
        Controls.Left = false;
        Controls.Right = false;
        Controls.Shoot = false;
        Controls.Enter = false;
    },
};

window.addEventListener("keydown", Controls.keyDown, false);
window.addEventListener("keyup", Controls.keyUp, false);
document.body.addEventListener("touchstart", Controls.touchStart, false);
document.body.addEventListener("touchend", Controls.touchEnd, false);

// Helper functions

function inRectangle(x, y, tlx, tly, sx, sy) {
    return ((x - tlx) >= 0) && ((x - tlx) <= sx) && ((y - tly) >= 0) && ((y - tly) <= sy)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Text-drawing functions

function drawText(ctx, x, y, text) {
    for (i = 0; i < text.length; i++) {
        var num;
        if (typeof text == "string")
            num = text.charCodeAt(i);
        else
            num = text[i];
        ctx.drawImage(Font, 8 * num, 0, 8, 8, x + (i * 8), y, 8, 8);
    }
}

function drawCenteredText(ctx, y, text) {
    var x = Math.floor(80 - (8*(text.length/2)));
    drawText(ctx, x, y, text);
}

function drawNumber(ctx, x, y, num, len) {
    chars = num.toString();
    while(chars.length < len)
        chars = "0" + chars
    drawText(ctx, x, y, chars);
}

// Play sound effects

PlaySound = function(sound) {
    var snd = new Audio("./sound/" + sound + ".wav");
    snd.play();
}

Loop();

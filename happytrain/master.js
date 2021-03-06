var gamecanvas = document.getElementById('gamecanvas');
var gamecontrols = document.getElementById('gamecontrols');
var activated = false;

function Loop() {
    setTimeout(Loop, 500 / 60);
    ctx = gamecanvas.getContext("2d");
    ctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
    if (activated) {
        Game.update();
        Game.draw(ctx);
    } else {
        ctx.drawImage(Titleimage, 32, 0);
        if (Controls.Enter) {
            Controls.Enter = false;
            Game.activate();
            activated = true;
        }
    }

    ctx.drawImage(Uiimage, 0, 192)
    drawNumbers(ctx, Game.passengers, 10, 2);
    drawNumbers(ctx, Game.maxpass, 14, 2);
    drawNumbers(ctx, Game.score, 34, 6);
}

function Controls() {
    Up: false;
    Down: false;
    Left: false;
    Right: false;
    Shoot: false;
    Enter: false;
}

Controls.keyDown = function(event) {
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
}

Controls.keyUp = function(event) {
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
}

Controls.touchStart = function(events) {
    if (activated == false) {
        document.getElementById('holderdiv2').innerHTML = "";
        Controls.enter = true;
        gamecontrols.style.display = "block";
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
}

function inRectangle(x, y, tlx, tly, sx, sy) {
    return ((x - tlx) >= 0) && ((x - tlx) <= sx) && ((y - tly) >= 0) && ((y - tly) <= sy)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Controls.touchEnd = function(events) {
    Controls.Up = false;
    Controls.Down = false;
    Controls.Left = false;
    Controls.Right = false;
    Controls.Shoot = false;
    Controls.Enter = false;
}

// Modified but originally from:
// http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
function loadJSON(name, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', name, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (!worldfile && (xobj.readyState == 4 && xobj.status == "200")) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

var worldfile;

//Activate();
window.addEventListener("keydown", Controls.keyDown, false);
window.addEventListener("keyup", Controls.keyUp, false);
document.body.addEventListener("touchstart", Controls.touchStart, false);
document.body.addEventListener("touchend", Controls.touchEnd, false);

var Titleimage = new Image();
Titleimage.src = "./images/title.png";
var Uiimage = new Image();
Uiimage.src = "./images/bottom.png";
var Numimage = new Image();
Numimage.src = "./images/cganum.png";

drawNumbers = function(ctx, num, x, len) {
    var chars = num.toString();
    while (chars.length < len) {
        chars = "0" + chars;
    }
    for (i = 0; i < len; i++) {
        num = chars.charCodeAt(i) - 48;
        ctx.drawImage(Numimage, 8 * num, 0, 8, 8, (x + i) * 8, 192, 8, 8);
    }
}

loadJSON("world.json", function(response) {
    if (!worldfile) {
        worldfile = JSON.parse(response);
        worldfile.forEach(function(e) {
            if (e != 0) {
                e.objects.forEach(function(i) {
                    if (i[0] == 1) {
                        Game.maxpass++;
                    }
                });
            }
        });
        Loop();
    }
});
//Loop();
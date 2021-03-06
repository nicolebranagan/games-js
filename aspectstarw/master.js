var gamecanvas = document.getElementById('gamecanvas');
var gamecontrols = document.getElementById('gamecontrols');
var activated = false;

function Loop() {
        setTimeout(Loop, 600 / 60);
	ctx = gamecanvas.getContext("2d");
	if (activated) {
	ctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
	
	Game.update();
	Game.draw(ctx);
	}
	else {
		ctx.drawImage(Titleimage, 105, 65);
		if (Controls.Enter) {
			Controls.Enter = false;
			Game.activate();
			activated = true;
		}
	}
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
	if (event.keyCode == 38) {
		Controls.Up = true;
	}
	if (event.keyCode == 40) {
		Controls.Down = true;
	}
	if (event.keyCode == 37) {
		Controls.Left = true;
	}
	if (event.keyCode == 39) {
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
	if (event.keyCode == 38) {
		Controls.Up = false;
	}
	if (event.keyCode == 40) {
		Controls.Down = false;
	}
	if (event.keyCode == 37) {
		Controls.Left = false;
	}
	if (event.keyCode == 39) {
		Controls.Right = false;
	}	
	if (event.keyCode == 13) {
		Controls.Enter = false;
	}
}

Controls.touchStart = function(events) {
	if (activated == false) {
		Controls.enter = true;
		gamecontrols.style.display = "block";
	}
	for (var i = 0; i < events.touches.length; i++) {
		touch = events.touches[i];
		var posx = Math.round(96 * (touch.pageX - gamecontrols.offsetLeft)/gamecontrols.width);
		var posy = Math.round(40 * (touch.pageY - gamecontrols.offsetTop)/gamecontrols.height);
		
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

//Activate();
window.addEventListener("keydown", Controls.keyDown, false);
window.addEventListener("keyup", Controls.keyUp, false);
document.body.addEventListener("touchstart", Controls.touchStart, false);
document.body.addEventListener("touchend", Controls.touchEnd, false);

var Titleimage = new Image();
Titleimage.src = "./images/title.png";
Loop();
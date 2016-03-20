function Game() { 

}

var GameStage = {
	RunMode: 0,
	DieMode: 1,
	WinMode: 2,
	PauseMode: 3,
}

// The activate function is called first and only once
Game.activate = function() {
	this.bgimage = new Image();
	this.bgimage.src = "./images/test_map.png";
	this.lives = 0;

	this.tileMap = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 4, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ];
	
	this.reset();
}

Game.reset = function() {
	document.getElementById('holderdiv').style.backgroundColor = "#000";
	this.player = new GameObject();
	this.player.image.src = "./images/player.png";
	this.shootLag = 0;
	this.lag = 0;
	
	this.projectiles = new Array();
	this.enemies = new Array();
	this.enemies.push(getEnemy(3 * 16, 12 * 16, 2));
	this.enemies.push(getEnemy(22 * 16, 12 * 16, 1));
	this.enemies.push(getEnemy(200, 11 * 16, 0));
	this.mode = GameStage.RunMode;
}

// The update function is called first
Game.update = function() {
	if (this.mode == GameStage.RunMode) {
		if (Controls.Enter) {
			this.lag = 20;
			Controls.Enter = false;
			this.mode = GameStage.PauseMode;
		}
		this.player.moving = false;
		if (Controls.Up) {
			this.player.moving = true;
			this.player.direction = 1;
		}
		else if (Controls.Down) {
			this.player.moving = true;
			this.player.direction = 0;
		}
		else if (Controls.Left) {
			this.player.moving = true;
			this.player.direction = 2;
		}
		else if (Controls.Right) {
			this.player.moving = true;
			this.player.direction = 3;
		}
		if (this.shootLag <= 0) {
			if (Controls.Shoot) {
				this.shootLag = 20;
				this.projectiles.push(new Projectile(this.player.x, this.player.y, this.player.aspect, this.player.direction));
			}
		}
		else
			this.shootLag = this.shootLag - 1;
		
		this.player.update();
		
		for (var i = 0; i < this.projectiles.length; i++) {
			var proj = this.projectiles[i];
			for (var j = 0; j < this.enemies.length; j++) {
				var enemy = this.enemies[j];
				if ((Math.pow(proj.x - enemy.x, 2) + Math.pow(proj.y - enemy.y, 2)) < 100) {
					proj.active = false;
					if (proj.aspect == enemy.aspect)
						enemy.active = false;
				}
			}
		}
		
		this.projectiles.forEach(function(e) {
			e.update();
			if (e.active == false) {
				var index = Game.projectiles.indexOf(e);
				Game.projectiles.splice(index, 1);
			}
		});
		
		this.enemies.forEach(function (e) {
			e.update()
			if (e.active == false) {
				var index = Game.enemies.indexOf(e);
				Game.enemies.splice(index, 1);
			}
			else if (Math.pow(e.x - Game.player.x, 2) + Math.pow(e.y - Game.player.y, 2) < 100) {
				Game.mode = GameStage.DieMode;
				Game.animCount = 255;
			}
		});
		
		if (this.enemies.length == 0)
		{
			Game.mode = GameStage.WinMode;
			document.getElementById('holderdiv').style.backgroundColor = "#FFF";
			this.animCount = 255;
		}
	}
	else if (this.mode == GameStage.DieMode || this.mode == GameStage.WinMode) {
		this.animCount = this.animCount - 2;
		if (this.animCount <= 0) {
			this.reset();
		}
	}
	else if (this.mode == GameStage.PauseMode) {
		if (this.lag > 0) {
			this.lag = this.lag - 1;
		}
		else
		{
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
	this.drawRoom(ctx);
	if (this.mode == GameStage.RunMode) {
		ctx.globalAlpha = 1.0;
	}
	else if (this.mode != GameStage.PauseMode) {
		ctx.globalAlpha = this.animCount / 255;
	}
	if (this.mode != GameStage.PauseMode) {
	this.projectiles.forEach(function(e) {e.draw(ctx)});
	this.player.draw(ctx);
	this.enemies.forEach(function(e) {e.draw(ctx)});
	}
}

Game.drawRoom = function(ctx) {
	var i = 0;
	for (var y = 0; y < 15; y++) {
		for (var x = 0; x < 25; x++) {
			ctx.drawImage(this.bgimage, 16 * this.tileMap[i], 0, 16, 16, x * 16, y * 16, 16, 16);
			i++;
		}
	}
}
// Functions regarding the map

Game.isSolid = function(x, y) {
	var i = Math.floor(x / 16) + 25 * Math.floor(y / 16);
	return this.tileMap[i] == 1;
}

Game.getTile = function(x, y) {
	var i = Math.floor(x / 16) + 25 * Math.floor(y / 16);
	return this.tileMap[i];
}

Game.squareSolid = function(x,y) {
	// Checks whether a square centered at loc is at all solid
	return Game.isSolid(x, y - 5) || Game.isSolid(x, y + 5) ||
		Game.isSolid(x - 5, y) || Game.isSolid(x + 5, y) ||
		Game.isSolid(x - 5, y - 5) || Game.isSolid(x - 5, y + 5) ||
		Game.isSolid(x + 5, y - 5) || Game.isSolid(x + 5, y + 5);
}

// GameObject
function GameObject() {
	this.aspect = 0; // Blue;
	this.active = true;
	this.x = 200;
	this.y = 104;
	this.currentFrame = 0;
	this.stallCount = 0;
	this.moving = false;
	this.direction = 0;
	this.image = new Image();
}

GameObject.prototype = {
	speed: 2,
	
	draw: function(ctx) {
		// Slice image
		ctx.drawImage(this.image, 16 * (2 * this.direction + this.currentFrame), this.aspect * 16, 16, 16, this.x - 8, this.y - 8, 16, 16);
	},
	
	_update: function() {
		this.stallCount = this.stallCount + 1;
		if (this.stallCount == 10) {
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
	
	move: function(x, y) {
		var testx = this.x + x;
		var testy = this.y + y;
		if (!Game.squareSolid(testx, testy)) {
			this.x = testx;
			this.y = testy;
		}
		
		var tile = Game.getTile(this.x, this.y);
		
		if (tile > 1) {
			this.aspect = tile - 2;
		}
	}
}

function Enemy() {}
Enemy.prototype = new GameObject();
Enemy.prototype.image.src = "./images/bigmouse.png";
Enemy.prototype.speed = 3;
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
				if (Math.abs(x_tar) > Math.abs(y_tar))
				{
					if (x_tar > 0)
						targetDir = 2;
					else
						targetDir = 3;
				}
				else
				{
					if (y_tar > 0)
						targetDir = 1;
					else
						targetDir = 0;
				}
				this.direction = targetDir;
			}
			else
				faceDir = getRandomInt(0, 4);
		}
	}
};

getEnemy = function(x, y, aspect) {
	var enemy = new Enemy();
	enemy.x = x;
	enemy.y = y;
	enemy.aspect = aspect;
	return enemy;
}

var ProjectileImage = new Image();
ProjectileImage.src = "./images/bullets.png";
function Projectile(x, y, aspect, direction) {
	this.active = true;
	this.aspect = aspect;
	this.x = x;
	this.y = y;
	this.aspect = aspect;
	this.direction = direction;
	this.image = ProjectileImage;
}
Projectile.prototype = {
	draw: function(ctx) {
		if (this.active) {
			ctx.drawImage(this.image, 0, this.aspect * 3, 3, 3, this.x - 1, this.y - 1, 3, 3);
		}
	},
	
	update: function() {
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
		if (!Game.squareSolid(testx, testy)) {
			this.x = testx;
			this.y = testy;
		}
		else
		{
			this.active = false;
		}
	}
}
//canvas
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 800;
document.body.appendChild(canvas);

//buffer
var bufferCanvas = document.createElement('canvas');
var bufferContext = canvas.getContext('2d');
bufferCanvas.width = 800;
bufferCanvas.height = 800;

var fps = 45;

//vars
var time = 0;
var maxEnergy = 20;
var energy = maxEnergy;
var s = 6;  //size of squares
var shipSpeed = 2;
var incrementSpeed = 0.1;
var starSpawnDensityVertical = 1400;
var totalStars = 7000;
var block = {x:0, y:0, width:0, height:0, dY: 0};
block.x = 200;
block.y = 500;
block.width = 75;
block.height = 100;
var collisions = 0;
var starList = [];
var laserList = [];
var laserCount = 0;

var laserPort = 1;
var barCount = 0;
var health = 10;
var enemyList = [];

var spawnBias = 0;  //percentage
var spawnBiasSize = 100;

function shipObject (x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

function laserLine (x, y, h, speed, alive, creationTime) {
	this.x = x;
	this.y = y;
	this.h = h;
	this.speed = speed;
	this.alive = alive;
	this.creationTime = creationTime;
	
	this.getRect = function () {
		return {x: this.x, y: this.y, height: this.h, width: 20};
	};
	
	this.kill = function () {
		this.alive = false;
		return;
	};
	
	this.increment = function () {
		this.x += this.speed + (3.2 * shipSpeed);
		return;
	};
}

function starPoint (x, y, d, colour, life, expiring, speedMultiple) {
	this.x = x;
	this.y = y;
	this.colour = colour;
	this.expiring = expiring;
	this.speedMultiple = speedMultiple;
}

function drawShip (x, y, s) {
	var path = new Path2D();
    path.moveTo(x, y + (s / 2));
    path.lineTo(x + s, y);
    path.lineTo(x + s,y + s);
	bufferContext.fillStyle = "white";
	bufferContext.fill(path);
}

function drawEnergyBar (colour, x) {
	bufferContext.fillStyle = colour;
	
	bufferContext.fillRect(10, 10 + 20 * barCount, 10 * x ,20);
	barCount += 1
}
function render () {
	
	bufferContext.fillStyle = "black";
	bufferContext.fillRect(0,0, 800, 800);
	bufferContext.fill();
	
	for (var i = 0; i < starList.length; i++){
		if (starList[i].d < 3){
			var tempStar = starList[i];
			bufferContext.fillStyle = starList[i].colour;
			bufferContext.fillRect(tempStar.x,tempStar.y,(tempStar.d * shipSpeed/3)+1,tempStar.d);
			
		}
	}
	
	for (var i = 0; i < laserCount; i++){
		if (laserList[i].alive){
		var tempLaser = laserList[i];
		bufferContext.fillStyle = "red";
		bufferContext.fillRect(tempLaser.x,tempLaser.y, 20, 2);
		}
	}
	
	bufferContext.fillStyle = "white";
	drawShip(block.x + 100, block.y + block.height / 4, block.height / 2);	
	
	if (accelerating > 0){
	
	bufferContext.fillStyle = "yellow";
	bufferContext.fillRect(block.x + 100 + block.height / 2, block.y + block.height / 4 ,accelerating * 2, 7);
	bufferContext.fillRect(block.x + 100 + block.height / 2, block.y + ((block.height / 4) * 3)- 7 ,accelerating * 2, 7);
	}
	for (var i = 0; i < starList.length; i++){
		if (starList[i].d > 2){
			var tempStar = starList[i];
			bufferContext.fillStyle = starList[i].colour;
			bufferContext.fillRect(tempStar.x,tempStar.y,(tempStar.d * shipSpeed/3)+1,tempStar.d);
		}
	}
	
	barCount = 0;	
	drawEnergyBar("red", energy);
	drawEnergyBar("green", shipSpeed);
	drawEnergyBar("orange", health);
	
	//context.drawImage(bufferCanvas, 0, 0);
}

var randomNumberPot = randomNumberPot || {};
 
randomNumberPot.p = [];
randomNumberPot.t = 0;
randomNumberPot.pointer = 0;

randomNumberPot.generateRandomNumbers = function (total) {
	
	this.t = total;
	
	for (var i = 0; i < total; i++){
		this.p.push(Math.random());
	}
	return;
};
	
randomNumberPot.next = function () {
	this.pointer = (this.pointer >= this.t) ? 0 : this.pointer += 1;
	return this.p[this.pointer];
};

 var repellerShield = true;
 
function increment () {
	
	block.x = 500 - (shipSpeed * 25);
	
	accelerating -= (accelerating > 0) ? 0.25 : 0;
	
	block.y += block.dY;
	
	var sRect = {x:block.x + 100, y:block.y + block.height / 4, height:block.height / 2, width:block.height / 2};
	
	if (energy < 0){
		alert("dead");
	}
	
	// lasers
	for (var i = 0; i < laserCount ; i++){
		
		laserList[i].increment();
		
		var lRect = laserList[i].getRect();
		
		var ageThreshold = time - laserList[i].creationTime > 10 ? true : false;
		
		if (ageThreshold  && isCollision(sRect,lRect,0.4) && laserList[i].alive){
			health += 10;
			laserList[i].kill();
		}
	}
		
		
		
	for (var i = 0; i < starList.length; i++){

		if (repellerShield && starList[i].d > 2){
		
		if (starList[i].x > block.x - 50 && starList[i].x < block.x){
			starList[i].y += 1 / ((starList[i].y - (block.y + (block.height / 2 ))) / (shipSpeed * 7));
		}
		
		if (starList[i].x > block.x + 30 && starList[i].x < block.x + 250){
			if (((starList[i].y - (block.y + (block.height / 2 ))) < 55 && ((starList[i].y - (block.y + (block.height / 2 ))) > -55))){
			starList[i].y -=   (starList[i].y - (block.y + (block.height / 2 )))/ (shipSpeed * 7);
			}
		}
		
		}
		starList[i].x += shipSpeed * starList[i].d;
		
		if (starList[i].x > 900 || starList[i].life < 1){
			pushStar(i,true);
		}
		
		if (starList[i].expiring == true) {
			starList[i].life -= 1;
			starList[i].x += (shipSpeed * starList[i].d) * starList[i].speedMultiple;
		}
		
		if (sheildOn){
			
			if (starList[i].d > 2 && starList[i].expiring == false) {
			
				var tRect = {x:starList[i].x,y:starList[i].y,height:starList[i].d,width:starList[i].d};
			
				if (isCollision(tRect,block,0.4)) {
					starList[i].expiring = true;	
					starList[i].colour = "MediumTurquoise";
					starList[i].speedMultiple = -0.5;
					shipSpeed = (shipSpeed < 2.5) ? shipSpeed : shipSpeed -= 0.005;
					energy += 0.005;
						if (energy > maxEnergy) {
							energy = maxEnergy;
						}
				}

				if (isCollision(tRect, sRect,0.4) && time > 50){
					energy -= 0.15;
					starList[i].expiring = true;	
					starList[i].colour = "Red";
					starList[i].speedMultiple = -0.9;		
				}
			}
		} 
	}
}

var sheildOn = true;
var sheildStrength = 0.4;


function isCollision (r1,r2,f){
	
	if (r1.x < r2.x + r2.width && 
		r1.x + r1.width > r2.x && 
		r1.y < r2.y + r2.height && 
		r1.height + r1.y > r2.y){
		
		return (randomPot.next() < f) ? true : false;
	}
	
	return false;
}

function initiate () {
	for (var i = 0; i < totalStars; i++){
		pushStar(i);
	}
}
	
function pushStar (i,b) {
	
	var tempX = ((b) ? -50 : (randomPot.next() * starSpawnDensityVertical) - (starSpawnDensityVertical / 2));
	
	var tempY = (randomPot.next() * starSpawnDensityVertical) - (starSpawnDensityVertical / 2);
	var tempD = (randomPot.next()  * 3) + 1;
	var tempColour = "gray";
	
	var tempStar = {x:tempX,y:tempY,d:tempD,colour:tempColour, life: 3, expiring: false};
	
	starList[i] = tempStar ;
}

function fireLaser() {
	energy -= 1;
	laserCount += 1;
	
	var t = new laserLine(block.x + block.width + 15, block.y, 1, -20, true, time);
	t.y += (laserPort == 1) ? block.height / 4 : block.height /  4 * 3;
	laserList.push(t);
	
	laserPort = (laserPort == 1) ? 0 : 1;
}

var accelerating = 0;

function doKeyDown (e) {

	switch (e.keyCode){
	case 37:  // w
		energy -= 0.1;
		shipSpeed += incrementSpeed; 
		accelerating += (accelerating < 10) ? 3 : 0;
		break;
	case 39:  // s
		shipSpeed -= (shipSpeed >= incrementSpeed) ? incrementSpeed : 0 ;
		break;
	case 38: // up arrow
		block.dY -= 3;
	//	block.y -= 10;
		break;
	case 40: // down arrow
		block.dY += 3;
	//	block.y += 10;
		break;
	case 32: //  space
	if (energy > 0) {
		fireLaser();
	}
		break;
	
	case 82: //  r
	
	break
	}
	 shipSpeed = Math.round(shipSpeed * 100) / 100;
}

function mainLoop () {
	increment();
	render();
	time += 1;
}

function main(){
	initiate();
	draw();
}

function draw() {
   setTimeout(function() {requestAnimationFrame(draw); mainLoop();}, 1000/fps);
}

canvas.addEventListener('keydown', doKeyDown, true);
document.body.addEventListener('keydown', doKeyDown, true);
var randomPot = randomNumberPot;
randomPot.generateRandomNumbers(6000);
main();


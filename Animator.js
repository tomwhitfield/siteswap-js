document.addEventListener("DOMContentLoaded", function(event) { 
	init()
	loop()
})

var ctx
var canvas

function init() {
	canvas = document.getElementById('stage')
	ctx = canvas.getContext('2d')
}

function loop() {
	var FPS = 30
	setInterval(function() {
		update()
		draw()
	}, 1000/FPS)
}

function update() {
	// Move props etc.
}

function draw() {
	ctx.clearRect (0, 0, canvas.width, canvas.height)
	
	// Draw juggler and props.
	
	drawBall(200, 400)
}




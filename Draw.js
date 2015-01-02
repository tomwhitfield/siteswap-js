function drawBall(x, y) {
	ctx.beginPath()
	ctx.arc(x, y, 10, 0, 2 * Math.PI, false)
	ctx.fillStyle = '#00B000'
	ctx.fill()
	ctx.lineWidth = 2
	ctx.strokeStyle = '#333333'
	ctx.stroke()
}

function drawRing(x, y) {
	var h = 80
	var w = 4
	
	ctx.beginPath()
	ctx.moveTo(x-w/2, y-h/2)
	ctx.lineTo(x+w/2, y-h/2)
	ctx.lineTo(x+w/2, y+h/2)
	ctx.lineTo(x-w/2, y+h/2)
	ctx.lineTo(x-w/2, y-h/2)
	ctx.fillStyle = '#00B000'
	ctx.fill()
	ctx.lineWidth = 1
	ctx.strokeStyle = '#333333'
	ctx.stroke()
}

function drawClub(x, y, r) {
	var h = 120
	var w = 18
	
	ctx.save()
    ctx.translate(x,y)
    ctx.rotate(r);
	
	ctx.lineWidth = 2
	ctx.strokeStyle = '#333333'
	
	// Upper body.
	ctx.beginPath()
	ctx.moveTo(-w/4, -h)
	ctx.lineTo(w/4, -h)
	ctx.lineTo(w/2, -4*h/5)
	ctx.lineTo(-w/2, -4*h/5)
	ctx.lineTo(-w/4, -h)
	ctx.fillStyle = '#00B000'
	ctx.fill()
	ctx.stroke()
	
	// Mid body.
	ctx.beginPath()
	ctx.moveTo(-w/2, -7*h/10)
	ctx.lineTo(w/2, -7*h/10)
	ctx.lineTo(w/2, -4*h/5)
	ctx.lineTo(-w/2, -4*h/5)
	ctx.lineTo(-w/2, -7*h/10)
	ctx.fillStyle = '#FFFFFF'
	ctx.fill()
	ctx.stroke()
	
	// Lower body.
	ctx.beginPath()
	ctx.moveTo(-w/5, -h/2)
	ctx.lineTo(w/5, -h/2)
	ctx.lineTo(w/2, -7*h/10)
	ctx.lineTo(-w/2, -7*h/10)
	ctx.lineTo(-w/5, -h/2)
	ctx.fillStyle = '#00B000'
	ctx.fill()
	ctx.stroke()
	
	// Handle.
	ctx.beginPath()
	ctx.moveTo(-w/7, -w/8)
	ctx.lineTo(w/7, -w/8)
	ctx.lineTo(w/5, -h/2)
	ctx.lineTo(-w/5, -h/2)
	ctx.lineTo(-w/7, -w/8)
	ctx.fillStyle = '#FFFFFF'
	ctx.fill()
	ctx.stroke()
	
	// Knob.
	ctx.beginPath()
	ctx.arc(0, -w/4, w/4, 0, 2 * Math.PI, false)
	ctx.fillStyle = '#00B000'
	ctx.fill()
	ctx.stroke()
	
	ctx.restore()
}

/* jshint -W097 */
'use strict';

const drawProp = (ctx, type, x, y, r, ry, scale, height, style) => {
  if (type == 'b')
    drawBall(ctx, x, y, scale, height, style);
  else if (type == 'c')
    drawClub(ctx, x, y, r, ry, scale, height, style);
  else if (type == 'r')
    drawRing(ctx, x, y, 0, r, scale, height, style);
  else
    drawImage(ctx, x, y, r, scale, height);
};

const drawBall = (ctx, x, y, scale, height, style, rotation = 0) => {
  const w = scale * height / 80;

  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(Math.cos(rotation/180 * Math.PI)) * w, w, 0, 2 * Math.PI, false);
  ctx.fillStyle = style.fill;
  ctx.fill();
  ctx.strokeStyle = style.stroke;
  ctx.stroke();
};

const drawRing = (ctx, x, y, bow, r, scale, height, style) => {
  r %= 360;
  const w = height * scale / 10;
  
  const ySin = Math.sin(r/180 * Math.PI);
  const yCos = Math.cos(r/180 * Math.PI);
  
  ctx.save();
  ctx.rotate(yCos * bow/180 * Math.PI);

  ctx.translate(x, y);
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = style.stroke;
  ctx.fillStyle = style.fill;
  
  function side(o) {
    // Line
    ctx.beginPath();
    ctx.moveTo(yCos * o + ySin * -w/2, 0);
    ctx.bezierCurveTo(yCos * o + ySin * -w/2, 2*w/3,
      yCos * o + ySin * w/2, 2*w/3,
      yCos * o + ySin * w/2, 0);
    ctx.bezierCurveTo(yCos * o + ySin * w/2, -2*w/3,
      yCos * o + ySin * -w/2, -2*w/3,
      yCos * o + ySin * -w/2, 0);
              
    ctx.lineTo(yCos * o + ySin * -2*w/5, 0);
    ctx.bezierCurveTo(yCos * o + ySin * -2*w/5, 8*w/15,
      yCos * o + ySin * 2*w/5, 8*w/15,
      yCos * o + ySin * 2*w/5, 0);
    ctx.bezierCurveTo(yCos * o + ySin * 2*w/5, -8*w/15,
      yCos * o + ySin * -2*w/5, -8*w/15,
      yCos * o + ySin * -2*w/5, 0);
    ctx.stroke();
    
    // Fill
    ctx.beginPath();
    ctx.moveTo(yCos * o + ySin * -w/2, 0);
    ctx.bezierCurveTo(yCos * o + ySin * -w/2, 2*w/3,
      yCos * o + ySin * w/2, 2*w/3,
      yCos * o + ySin * w/2, 0);
              
    ctx.lineTo(yCos * o + ySin * 2*w/5, 0);
    ctx.bezierCurveTo(yCos * o + ySin * 2*w/5, 8*w/15,
      yCos * o + ySin * -2*w/5, 8*w/15,
      yCos * o + ySin * -2*w/5, 0);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(yCos * o + ySin * -w/2, 0);
    ctx.bezierCurveTo(yCos * o + ySin * -w/2, -2*w/3,
      yCos * o + ySin * w/2, -2*w/3,
      yCos * o + ySin * w/2, 0);
              
    ctx.lineTo(yCos * o + ySin * 2*w/5, 0);
    ctx.bezierCurveTo(yCos * o + ySin * 2*w/5, -8*w/15,
      yCos * o + ySin * -2*w/5, -8*w/15,
      yCos * o + ySin * -2*w/5, 0);
    ctx.fill();
  }
  
  if (r <= 180) {
    side(w/100);
    side(0);
    side(-w/100);
  }

  if (r > 180) {
    side(-w/100);
    side(0);
    side(w/100);
  }
      
  ctx.restore();
};

const headImage = new Image();
// headImage.src = 'src/poop.png';

const propImage = new Image();
// propImage.src = 'src/poop.png';

const drawImage = (ctx, x, y, r, scale, height, r2, isHead) => {
  const image = isHead ? headImage : propImage;
  const widthScale = Math.abs(Math.cos(r2/180 * Math.PI));
  const w = scale * height / 40;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r/180 * Math.PI);
  ctx.scale(widthScale * w/image.width, w/image.width);
  ctx.drawImage(image, -image.width/2, -image.width/2);
  ctx.restore();
};

const drawClub = (ctx, x, y, r, ry, scale, height, style) => {
  r %= 360;
  const h = scale * 13/80 * height;
  const w = scale * 21/800 * height;
  
  const yCos = Math.cos(r/180 * Math.PI);
  const ySin = 1.4*Math.sin(r/180 * Math.PI);
  
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(ry/180 * Math.PI);
  
  ctx.strokeStyle = style.stroke;
  
  // Knob
  ctx.beginPath();
  // Top curves
  if (r < 270) {
    ctx.moveTo(-w/5, yCos * 11*h/24);
    ctx.bezierCurveTo(-w/5, yCos * 11*h/24 + ySin * w/5,
      w/5, yCos * 11*h/24 + ySin * w/5,
      w/5, yCos * 11*h/24);
  }
  if (r < 180 || r >= 270) {
    ctx.moveTo(w/5, yCos * 11*h/24);
    ctx.bezierCurveTo(w/5, yCos * 11*h/24 - ySin * w/5,
      -w/5, yCos * 11*h/24 - ySin * w/5,
      -w/5, yCos * 11*h/24);
  }
  
  // Straight part
  ctx.moveTo(-w/5, yCos * 11*h/24);
  ctx.lineTo(-w/5, yCos * h/2);
  ctx.moveTo(w/5, yCos * 11*h/24);
  ctx.lineTo(w/5, yCos * h/2);
  
  // Bottom curves
  if (r < 270) {
    ctx.moveTo(-w/5, yCos * h/2);
    ctx.bezierCurveTo(-w/5, yCos * h/2 + ySin * w/5,
      w/5, yCos * h/2 + ySin * w/5,
      w/5, yCos * h/2);
  }
  if (r < 180 || r >= 270) {
    ctx.moveTo(w/5, yCos * h/2);
    ctx.bezierCurveTo(w/5, yCos * h/2 - ySin * w/5,
      -w/5, yCos * h/2 - ySin * w/5,
      -w/5, yCos * h/2);
  }
  
  ctx.stroke();
  
  // Handle
  if (r < 267 || r > 273) {
    ctx.beginPath();
    
    // Straight part
    ctx.moveTo(-w/5, 0);
    ctx.lineTo(-w/7, yCos * 11*h/24);
    ctx.moveTo(w/5, 0);
    ctx.lineTo(w/7, yCos * 11*h/24);
    
    // Bottom curves
    if (r < 270) {
      ctx.moveTo(-w/7, yCos * 11*h/24);
      ctx.bezierCurveTo(-w/7, yCos * 11*h/24 + ySin * w/7,
        w/7, yCos * 11*h/24 + ySin * w/7,
        w/7, yCos * 11*h/24);
    }
    if (r < 180 || r >= 270) {
      ctx.moveTo(w/7, yCos * 11*h/24);
      ctx.bezierCurveTo(w/7, yCos * 11*h/24 - ySin * w/7,
        -w/7, yCos * 11*h/24 - ySin * w/7,
        -w/7, yCos * 11*h/24);
    }
    
    ctx.stroke();
  }
  
  // Lower body
  ctx.beginPath();
  
  if (r < 258 || r > 282) {
    // Top curves
    if (r >= 90 && r < 270) {
      ctx.moveTo(-w/5, 0);
      ctx.bezierCurveTo(-w/5, ySin * w/5,
        w/5, ySin * w/5,
        w/5, 0);
    }
    if (r < 90 || r >= 270) {
      ctx.moveTo(w/5, 0);
      ctx.bezierCurveTo(w/5, -ySin * w/5,
        -w/5, -ySin * w/5,
        -w/5, 0);
    }
    
    // Straght part
    if (r <= 82 || r >= 98) {
      ctx.moveTo(-w/5, 0);
      ctx.lineTo(-w/2, yCos * -2*h/10);
      ctx.moveTo(w/5, 0);
      ctx.lineTo(w/2, yCos * -2*h/10);
    }
  }
  
  // Top curves
  if (r > 82 && r < 270) {
    ctx.moveTo(-w/2, yCos * -2*h/10);
    ctx.bezierCurveTo(-w/2, yCos * -2*h/10 + ySin * w/2,
      w/2, yCos * -2*h/10 + ySin * w/2,
      w/2, yCos * -2*h/10);
  }
  if (r < 98 || r >= 270) {
    ctx.moveTo(w/2, yCos * -2*h/10);
    ctx.bezierCurveTo(w/2, yCos * -2*h/10 - ySin * w/2,
      -w/2, yCos * -2*h/10 - ySin * w/2,
      -w/2, yCos * -2*h/10);
  }
  
  ctx.stroke();
  
  // Middle body
  ctx.beginPath();
  
  if (r < 76 || r > 104) {
    // Straght part
    ctx.moveTo(-w/2, yCos * -2*h/10);
    ctx.lineTo(-w/2, yCos * -3*h/10);
    ctx.moveTo(w/2, yCos * -2*h/10);
    ctx.lineTo(w/2, yCos * -3*h/10);
  }
  
  // Top curves
  if (r >= 90 && r < 282) {
    ctx.moveTo(-w/2, yCos * -3*h/10);
    ctx.bezierCurveTo(-w/2, yCos * -3*h/10 + ySin * w/2,
      w/2, yCos * -3*h/10 + ySin * w/2,
      w/2, yCos * -3*h/10);
  }
  if (r < 90 || r > 258) {
    ctx.moveTo(w/2, yCos * -3*h/10);
    ctx.bezierCurveTo(w/2, yCos * -3*h/10 - ySin * w/2,
      -w/2, yCos * -3*h/10 - ySin * w/2,
      -w/2, yCos * -3*h/10);
  }
  
  // Upper body
  if ((r <= 258 || r >= 282) && (r < 80 || r > 100)) {
    // Straght part
    ctx.moveTo(-w/2, yCos * -3*h/10);
    ctx.lineTo(-w/4, yCos * -5*h/10);
    ctx.moveTo(w/2, yCos * -3*h/10);
    ctx.lineTo(w/4, yCos * -5*h/10);
  }
  
  if (r < 80 || r > 100) {
    // Top cap curves
    if (r >= 90) {
      ctx.moveTo(-w/4, yCos * -5*h/10);
      ctx.bezierCurveTo(-w/4, yCos * -5*h/10 + ySin * w/4,
        w/4, yCos * -5*h/10 + ySin * w/4,
        w/4, yCos * -5*h/10);
    }
    
    if (r < 90 || r >= 180) {
      ctx.moveTo(w/4, yCos * -5*h/10);
      ctx.bezierCurveTo(w/4, yCos * -5*h/10 - ySin * w/4,
        -w/4, yCos * -5*h/10 - ySin * w/4,
        -w/4, yCos * -5*h/10);
    }
  }
  
  ctx.stroke();

  ctx.restore();
};


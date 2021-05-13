/* jshint -W097 */
'use strict';

const drawProp = (ctx, type, x, y, r, ry, scale, height) => {
  if (type == 'b')
    drawBall(ctx, x, y, scale, height);
  else if (type == 'c')
    drawClub(ctx, x, y, r, ry, scale, height);
  else if (type == 'r')
    drawRing(ctx, x, y, 0, r, scale, height);
  else
    drawImage(ctx, x, y, r, scale, height);
};

const drawBall = (ctx, x, y, scale, height, fillColour, rotation = 0) => {
  const w = scale * height / 80;

  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(Math.cos(rotation/180 * Math.PI)) * w, w, 0, 2 * Math.PI, false);
  ctx.fillStyle = fillColour || '#8BC34A';
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.stroke();
};

const drawRing = (ctx, x, y, bow, r, scale, height) => {
  r %= 360;
  const w = height * scale / 10;
  
  const ySin = Math.sin(r/180 * Math.PI);
  const yCos = Math.cos(r/180 * Math.PI);
  
  ctx.save();
  ctx.rotate(yCos * bow/180 * Math.PI);

  ctx.translate(x, y);
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333333';
  ctx.fillStyle = '#9999FF';
  
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

const drawClub = (ctx, x, y, r, ry, scale, height) => {
  r %= 360;
  const h = scale * 13/80 * height;
  const w = scale * 21/800 * height;
  
  const yCos = Math.cos(r/180 * Math.PI);
  const ySin = 1.4*Math.sin(r/180 * Math.PI);
  
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(ry/180 * Math.PI);
  
  ctx.strokeStyle = '#333333';
  
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

const drawJuggler = (ctx, x, y, r, scale, height, headBob, pos, propType, holding, headMoveX) => {
  r %= 360;
  const h = scale*height/4;
  const w = scale*height/8;
  
  const yCos = Math.cos(r/180 * Math.PI);
  const ySin = Math.sin(r/180 * Math.PI);
  
  ctx.save();
  ctx.translate(x, y);
  
  ctx.strokeStyle = '#333333';
  
  // Head image
  // drawImage(ctx, headMoveX, -36*h/40 + headBob, 0, scale, 3.2*height, r, true);

  // Head
  ctx.fillStyle = '#FFDAC8';
  ctx.beginPath();
  ctx.moveTo(yCos * -5*h/36 + headMoveX, -33*h/40 + headBob);
  ctx.bezierCurveTo(yCos * -5*h/36 + headMoveX, -41*h/40 + headBob,
    yCos * 5*h/36 + headMoveX, -41*h/40 + headBob,
    yCos * 5*h/36 + headMoveX, -33*h/40 + headBob);
  ctx.bezierCurveTo(yCos * 5*h/36 + headMoveX, -25*h/40 + headBob,
    yCos * -5*h/36 + headMoveX, -25*h/40 + headBob,
    yCos * -5*h/36 + headMoveX, -33*h/40 + headBob);
  ctx.fill();
  ctx.stroke();

  function drawLeftArm() {

    const handX = yCos * (pos.left.x - 6*w/8) + ySin * h/3;
    const handY = -5*h/50 + pos.left.y;

    ctx.beginPath();
    ctx.moveTo(yCos * -w/2, -5*h/8);
    ctx.lineTo(yCos * (-pos.left.x/8 - 6*w/8), -h/7); // Elbow
    ctx.lineTo(handX, handY); // Hand
    ctx.stroke();

    // Prop in left hand
    if (holding.left) {
      const split = (propType === 'r') ? h/20 : (holding.left === 1) ? 0 : pos.left.y;

      const startX = yCos * (pos.left.x - 6*w/8) + ySin * ((propType === 'r') ? h/2 : h/3); // - ((propType === 'r') ? (split / 2) : 0);
      const startY = handY - ((propType === 'r') ? 0 : (split / 2));

      for (let i = 0; i < holding.left; i++) {
        const holdingX = startX + ((propType === 'r') ? i * (split / holding.left) : 0);
        let holdingY = startY + ((propType === 'r') ? 0 : i * (split / holding.left));

        let rotation = r;
        if (propType === 'c') {
          rotation = 270 - 0.5 * pos.left.y;
          holdingY += 0.5 * pos.left.y;
        }

        drawProp(ctx, propType, holdingX, holdingY, rotation, 0, scale, height);
      }
    }
  }

  function drawRightArm() {
    const handX = yCos * (pos.right.x + 6*w/8) + ySin * h/3;
    const handY = -5*h/50 + pos.right.y;

    ctx.beginPath();
    ctx.moveTo(yCos * w/2, -5*h/8);
    ctx.lineTo(yCos * (6*w/8 - pos.right.x/8), -h/7); // Elbow
    ctx.lineTo(handX, handY); // Hand
    ctx.stroke();
    
    // Prop in right hand
    if (holding.right) {
      const split = (propType === 'r') ? h/20 : (holding.right === 1) ? 0 : pos.right.y;
      
      const startX = yCos * (pos.right.x + 6*w/8) + ySin * ((propType === 'r') ? h/2 : h/3); //  - ((propType === 'r') ? (split / 2) : 0);
      const startY = handY - ((propType === 'r') ? 0 : (split / 2));

      for (let i = 0; i < holding.right; i++) {

        const holdingX = startX + ((propType === 'r') ? i * (split / holding.right) : 0);
        let holdingY = startY + ((propType === 'r') ? 0 : i * (split / holding.right));

        let rotation = r;
        if (propType === 'c') {
          rotation = 270 - 0.5 * pos.right.y;
          holdingY += 0.5 * pos.right.y;
        }

        drawProp(ctx, propType, holdingX, holdingY, rotation, 0, scale, height);
      }
    }
  }

  if (r >= 180) {
    drawLeftArm();
  } else {
    drawRightArm();
  }
  
  // Body
  ctx.fillStyle = '#BDBDBD';
  ctx.beginPath();
  ctx.moveTo(yCos * -w/2, -5*h/8);
  ctx.lineTo(yCos * w/2, -5*h/8);
  ctx.lineTo(yCos * 7*w/20, 0);
  ctx.lineTo(yCos * -7*w/20, 0);
  ctx.lineTo(yCos * -w/2, -5*h/8);
  ctx.fill();
  ctx.stroke();
  
  if (r < 180) {
    drawLeftArm();
  } else {
    drawRightArm();
  }
      
  ctx.restore();
};

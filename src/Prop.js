/* jshint -W097 */
'use strict';

function Prop(propType, style) {
  this.propType = propType;
  this.style = style;
}

Prop.prototype.throw = function(ssValue, startX, destX, timeUnit, a) {
  this.ssValue = ssValue;

  // How long the throw should take
  this.t = ssValue * timeUnit - 0.5 * timeUnit;

  // Position
  this.x = startX;
  this.y = 0;

  // Position velocities
  this.vx = (destX - startX) / this.t;
  this.vy = -(a * this.t) / 2;

  // Initial rotation
  if (this.propType === 'r') {
    // Tangential to direction of travel
    this.r = 90 - 180 * Math.atan(-this.vy / this.vx) / Math.PI;

    if (this.r > 90)
      this.r -= 180;

    if (Math.round(ssValue) === 1 || Math.round(ssValue) === 2)
      this.r = 0;
    else if (Math.round(ssValue) === 3)
      this.r *= 0.2;
    else if (Math.round(ssValue) === 5)
      this.r *= 0.2;
  }
  // Clubs and images
  else if (this.propType !== 'b') {
    this.r = 270;
  }

  // Rotational velocity
  if (this.propType == 'i') 
    this.vr = 30 * (Math.random() - 0.5);
  else {
    if (ssValue == 2)
      this.vr = 0;
    else if (this.propType === 'c')
      this.vr = 360 * (Math.floor(Math.round(ssValue) / 2)) / ((ssValue - 0.5) * timeUnit);
    else if (this.propType === 'r')
      this.vr = 0;
  }
};

Prop.prototype.update = function(a) {
  this.x += this.vx;
  this.vy += a;
  this.y += this.vy;
  this.r += this.vr;

  if (--this.t < 2) return (this.x < 0) ? 'left' : 'right';
  return 'none';
};

Prop.prototype.draw = function(ctx, x, y, r, scale, height) {
  const yCos = Math.cos(r / 180 * Math.PI);
  const ySin = Math.sin(r / 180 * Math.PI);

  const h = scale * height / 4;

  ctx.save();
  ctx.translate(x, y);

  if (this.propType == 'b')
    drawBall(ctx, yCos * this.x + ySin * h/3, this.y, scale, height, this.style);

  else if (this.propType == 'c')
    drawClub(ctx, yCos * this.x + ySin * h/3, this.y, yCos * this.r, 5 * this.vx, scale, height, this.style);

  else if (this.propType == 'r') {
    const bow = (this.ssValue % 2 === 1) ? ((this.ssValue - 1) / 2) * this.vx : 0;
    drawRing(ctx, yCos * this.x + ySin * h/2, this.y, bow, r, scale, height, this.style);
  }
  else 
    drawImage(ctx, yCos * this.x + ySin * h/3, this.y, this.r, scale, height);

  ctx.restore();
};

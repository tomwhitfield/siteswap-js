/* jshint -W097 */
'use strict';

function ClubBalance(timeUnit) {
  this.timeUnit = timeUnit;

  this.maxR = 2.5;

  this.i = 0;

  this.x = 0;
  this.y = 0;

  this.px = 0;
  this.py = 0;

  this.r = 0;
}

ClubBalance.prototype.update = function(scale, height) {
  const sin = Math.sin(this.i * Math.PI / (4 * this.timeUnit));
  
  this.r = sin * this.maxR;

  // Make it look like the club is pivoting at the knob
  const theta = 90 - Math.abs(this.r) / 2;
  const a = (scale * 13/80 * height) * Math.sin(Math.PI * this.r / (2 * 180)) / 2;

  this.px = 2 * a * Math.sin(theta * Math.PI / 180);
  this.py = 2 * a * Math.cos(theta * Math.PI / 180);

  this.x = -scale * sin * height / 200;
  this.i++;
};

ClubBalance.prototype.draw = function(ctx, x, y, scale, height) {
  drawClub(ctx, x + this.x + this.px, y + this.y + this.py, 0, this.r, scale, height);
};

ClubBalance.prototype.getHeadReaction = function() {
  return this.x;
};
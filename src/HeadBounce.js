/* jshint -W097 */
'use strict';

function HeadBounce(timeUnit, left, zeros, twos) {
  this.beatLength = 2;
  this.beatIndex = 0;
  this.beats = [];

  const allSame = (character, inputArray = []) => {
    const string = inputArray.map(e => e.value).join();
    return string === character || (string.charAt(0) === character && /^(.)\1+$/.test(string));
  };

  let bL = this.beatLength;
  for (let i = 2; i < left.length + 2; i += 2) {
    const throws = left[i % left.length];

    if ((zeros && allSame('0', throws)) || (twos && allSame('2', throws))) {
      bL += 2;
    }
    else {
      this.beats.push(bL);
      bL = this.beatLength;
    }
  }

  this.timeUnit = timeUnit;

  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.t = timeUnit;
}

HeadBounce.prototype.update = function(a) {
  // New bounce
  if (this.t === 0) {
    // Beats the bounce should take
    this.t = this.beats[this.beatIndex++ % this.beats.length] * this.timeUnit - 1;
    this.vy = -(a * this.t) / 2;
    this.y = 0;
  }
  else {
    this.vy += a;
    this.y += this.vy;
    this.t--;

    if (this.y > 0)
      this.y = 0;
  }
};

HeadBounce.prototype.draw = function(ctx, x, y, r, scale, height) {
  drawBall(ctx, x + this.x, y + this.y, scale, height, '#DDDDDD', r);
};

/**
 * @return {float} recoil - in range [-0.25, 0.75]
 */
HeadBounce.prototype.getHeadRecoil = function() {
  let recoil = 0;
  let scale = 0.5;
  const hitDuration = this.timeUnit / 2;

  // Move up and attack the ball
  if (this.t < hitDuration) {
    const fraction = (this.t / hitDuration) - Math.PI / 4;
    recoil = Math.pow(Math.sin(fraction * 5 * Math.PI / 8), 2) - 0.25;
    
    // Scale for power
    scale = this.beats[this.beatIndex % this.beats.length] / 4;
  }

  // Move back to the normal position
  else if (this.beats[(this.beatIndex + this.beats.length - 1) % this.beats.length] * this.timeUnit - this.t < hitDuration) {
    const fraction = (this.beats[(this.beatIndex + this.beats.length - 1) % this.beats.length] * this.timeUnit - this.t) / hitDuration;
    recoil = Math.pow(Math.sin(Math.PI / 2 + fraction * 3 * Math.PI / 8), 2) - 0.25;

    // Scale for power
    scale = this.beats[(this.beatIndex + this.beats.length - 1) % this.beats.length] / 4;
  }

  if (scale > 1)
    scale = 1;

  return scale * recoil;
};
const SiteswapJS = (function () {
/**
Copyright 2021 Tom Whitfield

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.'use strict';
*/

/* jshint -W097 */
'use strict';

function SiteswapJS(canvasID, siteswap, options) {
  this.canvas = document.getElementById(canvasID);
  this.ctx = this.canvas.getContext('2d');

  if (typeof siteswap !== 'string' || siteswap.length === 0) return;

  this.options = this.setDefaultOptions(options);
  this.options.siteswap = siteswap.toLowerCase();

  // Canvas dimensions - for scaling
  this.options.width = this.canvas.width;
  this.options.height = this.canvas.height;

  this.paused = false;

  // For the loop
  this.startTime = Date.now();
  this.frameDuration = 1000 / this.options.fps;
  this.lag = 0;

  this.juggler = new Juggler(this.options);

  if (this.options.exportGif) {
    this.initGifEncoder();
    this.gifTest = 0;

    for (var i = 0; i < 10 * this.juggler.patternLength; i++) {
      this.update();
    }
  }
  else if (this.options.controls) {
    this.addListeners();
  }
}

SiteswapJS.prototype.loop = function(self) {
  // Time since last frame
  const currentTime = Date.now();
  const elapsedTime = currentTime - self.startTime;
  self.startTime = currentTime;

  self.lag += elapsedTime;

  // Update the logic while the lag is greater than the frame duration
  // while (self.lag >= self.frameDuration) {
    self.update();
    self.lag -= self.frameDuration;
  // }

  self.draw();

  if (!self.paused) {
    window.requestAnimationFrame(function() {
      self.loop(self);
    });
  }
};

SiteswapJS.prototype.update = function() {
  this.juggler.update();
};

SiteswapJS.prototype.draw = function() {
  // Clear canvas
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Background
  if (this.options.styles.background) {
    this.ctx.fillStyle = this.options.styles.background.fill;
    this.ctx.strokeStyle = this.options.styles.background.stroke;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw juggler and props
  this.juggler.draw(this.ctx);

  if (this.options.debug) {
    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.fillText("r: " + Math.round(this.juggler.rotation), 10, this.canvas.height - 10);
  }

  // Draw a frame to the GIF
  if (this.options.exportGif) {
    if (this.gifTest++ < this.juggler.patternLength)
      this.gifEncoder.addFrame(this.ctx);
    else if (this.gifTest === this.juggler.patternLength + 1)
      this.finishGifEncoder();
  }
};

SiteswapJS.prototype.setDefaultOptions = function(custom) {
  const options = {
    fps: 60,
    throwsPerSecond: 3,
    propType: 'b',
    exportGif: false,
    spinOn0s: false,
    spinOn2s: false,
    headBounce: false,
    clubBalance: false,
    debug: false,
    controls: false,
    styles: {
      background: {
        fill: '#FFF',
        stroke: '#FFF',
      },
      props: [
        {
          fill: '#8BC34A',
          stroke: '#333',
        },
      ],
      headBounce: {
        fill: '#DDD',
        stroke: '#333',
      },
      clubBalance: {
        stroke: '#333',
      },
      head: {
        fill: '#FFDAC8',
        stroke: '#333',
      },
      body: {
        fill: '#BDBDBD',
        stroke: '#333',
      },
    }
  };

  function combineOptions(options, custom) {
    for (const key of Object.keys(options)) {
      if (!custom[key]) continue;

      if (typeof custom[key] === 'object' && !Array.isArray(custom[key])) combineOptions(options[key], custom[key]);
      else options[key] = custom[key];
    }
  }

  combineOptions(options, custom);

  if (options.propType === 'c') options.controls = false;

  return options;
};

SiteswapJS.prototype.initGifEncoder = function() {
  if (typeof GIFEncoder !== 'function') throw new Error('GIFEncoder not found');

  this.gifEncoder = new GIFEncoder();

  // Loop forever and set framerate
  this.gifEncoder.setRepeat(0);
  this.gifEncoder.setDelay(40);

  this.gifEncoder.start();
};

SiteswapJS.prototype.finishGifEncoder = function() {
  this.gifEncoder.finish();
  const binaryGif = this.gifEncoder.stream().getData();
  const dataUrl = 'data:image/gif;base64,' + encode64(binaryGif);
  document.getElementById('gif-output').src = dataUrl;
};

SiteswapJS.prototype.start = function() {
  const self = this;
  window.requestAnimationFrame(function() {
    self.loop(self);
  });
};

SiteswapJS.prototype.pause = function() {
  this.paused = true;
};

SiteswapJS.prototype.resume = function() {
  this.paused = false;
  this.start();
};

SiteswapJS.prototype.stop = function() {
  this.paused = true;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

SiteswapJS.prototype.getJuggler = function() {
  return this.juggler;
};

SiteswapJS.prototype.addListeners = function() {
  const self = this;

  let xPosition = 0;
  let mouseDown = false;
  
  const down = (event) => {
    mouseDown = true;
    xPosition = event.screenX || event.changedTouches[0].screenX;
  };

  const move = (event) => {
    event.stopPropagation();
    if (mouseDown) {
      const newXPosition = event.screenX || event.changedTouches[0].screenX;
      const delta =  newXPosition - xPosition;
      xPosition = newXPosition;
      self.juggler.rotate(delta);
    }
  };

  const up = () => {
    mouseDown = false;
  };

  const doubleClick = () => {
    self.juggler.rotation = 0;
  };

  this.canvas.addEventListener('touchstart', down);
  this.canvas.addEventListener('mousedown', down);

  document.addEventListener('touchmove', move);
  document.addEventListener('mousemove', move);

  document.addEventListener('touchend', up);	
  document.addEventListener('mouseup', up);

  this.canvas.addEventListener('dblclick', doubleClick);
};
/* jshint -W097 */
'use strict';

function ClubBalance(timeUnit, style) {
  this.timeUnit = timeUnit;
  this.style = style;

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
  drawClub(ctx, x + this.x + this.px, y + this.y + this.py, 0, this.r, scale, height, this.style);
};

ClubBalance.prototype.getHeadReaction = function() {
  return this.x;
};/* jshint -W097 */
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
propImage.src = 'src/poop.png';

const drawImage = (ctx, x, y, r, scale, height, r2 = 0, isHead = false) => {
  const image = isHead ? headImage : propImage;
  const w = scale * height / 12;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r/180 * Math.PI);
  ctx.scale(w/image.width, w/image.width);
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

/* jshint -W083 */
/* jshint -W097 */
'use strict';

function Hands(ss) {
  this.siteswap = ss.replace(/\s/g,'').split('2t').join('2');
  this.left = [];
  this.right = [];
  this.type = '';
  this.max = 0;
  this.number = 0;
  this.valid = this.validateSiteswap();
  this.catches = {};

  if (this.valid) {
    this.sync = this.type === 'synchronous' || this.type === 'synchronous multiplex';
    this.period = this.left.length;
    this.initCatches();
  } else {
    throw new Error('Invalid siteswap');
  }

  // For keeping track of which is the next throw to make
  this.leftIndex = 0;
  this.rightIndex = 0;

  // Where the hands are
  this.positions = {
    left: {
      x: 0,
      y: 0,
    },
    right: {
      x: 0,
      y: 0,
    },
  };

  this.positionQueue = {
    left: {
      x: [0],
      y: [0],
    },
    right: {
      x: [0],
      y: [0],
    },
  };

  this.spinning = false;
}

Hands.prototype.getNextThrows = function() {
  const throws = {
    left: [],
    right: []
  };

  // Left throws
  const l = this.left[this.leftIndex][0];
  if (l.active && l.value !== 0)
    throws.left = this.left[this.leftIndex];

  // Right throws
  const r = this.right[this.rightIndex][0];
  if (r.active && r.value !== 0)
    throws.right = this.right[this.rightIndex];

  // Advance indices
  if (++this.leftIndex === this.left.length)
    this.leftIndex = 0;
  if (++this.rightIndex === this.right.length)
    this.rightIndex = 0;

  return throws;
};

Hands.prototype.update = function(count, timeUnit, height, scale, spinLength) {
  if (this.spinning && this.positionQueue.left.x.length === 0)
    this.spinning = false;

  const w = height * scale / 16;

  const scoopRX = 0.45 * w;
  const scoopRY = 2.5 * scoopRX;

  if (!this.spinning && spinLength === -1) {
    // Regular throw and catch movements
    const leftCatchCondition = count % (2 * timeUnit) === timeUnit + 1;
    const leftThrowCondition = count % (2 * timeUnit) === Math.round((timeUnit / 2) + 1);
    const rightCatchCondition = this.sync ? leftCatchCondition : count % (2 * timeUnit) === 1;
    const rightThrowCondition = this.sync ? leftThrowCondition : count % (2 * timeUnit) === Math.round((3 * timeUnit / 2) + 1);
  
    let centreLeft = false;
    let centreRight = false;

    // Calculate the movements for the next action
    if (leftCatchCondition) {
      centreLeft = this.catches.left[(this.leftIndex + 1) % this.period].reduce((a, b) => a + b, 0) === 0;
      if (!centreLeft) {
        this.smoothTo('left', 'x', -scoopRX, Math.round(3 * timeUnit / 2 - 0.5));
        this.bounceToY('left', -scoopRY, Math.round(3 * timeUnit / 2 - 0.5));	
      }
    }
    else if (leftThrowCondition) {
      centreLeft = this.left[this.leftIndex].reduce((a, b) => a + Math.abs(b), 0) === 0;
      if (!centreLeft) {
        this.smoothTo('left', 'x', scoopRX, Math.round(timeUnit / 2));
        this.bounceToY('left', scoopRY, Math.round(timeUnit / 2));
      }
    }

    if (rightCatchCondition) {
      centreRight = this.catches.right[(this.rightIndex + 1) % this.period].reduce((a, b) => a + b, 0) === 0;
      if (!centreRight) {
        this.smoothTo('right', 'x', scoopRX, Math.round(3 * timeUnit / 2 - 0.5));
        this.bounceToY('right', -scoopRY, Math.round(3 * timeUnit / 2 - 0.5));
      }
    }
    else if (rightThrowCondition) {
      centreRight = this.right[this.rightIndex].reduce((a, b) => a + Math.abs(b), 0) === 0;
      if (!centreRight) {
        this.smoothTo('right', 'x', -scoopRX, Math.round(timeUnit / 2));
        this.bounceToY('right', scoopRY, Math.round(timeUnit / 2));
      }
    }

    // Move to "ready position" if nothing to do
    if (centreLeft && Math.abs(this.positions.left.x) > 0.1)
      this.smoothTo('left', 'x', 0, timeUnit);
    if (centreRight && Math.abs(this.positions.right.x) > 0.1)
      this.smoothTo('right', 'x', 0, timeUnit);
  }
  // TODO
  // else if (!this.spinning) {
  //   // Tuck in arms for spins
  //   this.spinning = true;
  //   this.tuckIn('left', spinLength, 3 * timeUnit / 2, scoopRX);
  //   this.tuckIn('right', spinLength, 3 * timeUnit / 2, scoopRX);
  // }
  
  // Follow the precalculated movements
  this.positions.left.x = this.positionQueue.left.x.shift() || this.positions.left.x;
  this.positions.left.y = this.positionQueue.left.y.shift() || this.positions.left.y;
  this.positions.right.x = this.positionQueue.right.x.shift() || this.positions.right.x;
  this.positions.right.y = this.positionQueue.right.y.shift() || this.positions.right.y;
};

Hands.prototype.tuckIn = function(side, totalTime, tU, scoopRX) {
  let centre = {
    x: ((side === 'left') ? 1 : -1) * scoopRX,
    y: -2 * scoopRX
  };

  let returnTo = {
    x: ((side === 'left') ? -1 : 1) * scoopRX,
    y: 0
  };

  this.positionQueue[side].x = [];
  this.positionQueue[side].y = [];

  // Tuck in
  this.smoothTo(side, "x", centre.x, tU / 2);
  this.smoothTo(side, "y", centre.y, tU / 2);

  const lastX = this.positionQueue[side].x[this.positionQueue[side].x.length - 1];
  const lastY = this.positionQueue[side].y[this.positionQueue[side].y.length - 1];

  // Hold position
  for (let i = 0; i < totalTime - tU; i++) {
    this.positionQueue[side].x.push(lastX);
    this.positionQueue[side].y.push(lastY);
  }

  // Return to original position
  this.smoothTo(side, 'x', returnTo.x, tU / 2, lastX);
  this.smoothTo(side, "y", returnTo.y, tU / 2, lastY);
};

Hands.prototype.smoothTo = function(side, component, target, time, currentPos) {
  let current = currentPos || this.positions[side][component];
  const difference = target - current;

  let sum = 0;
  const deltas = [];
  for (let i = 0; i < time; i++) {
    deltas.push(Math.sin(i * Math.PI / time));
    sum += deltas[i];
  }

  const scale = difference / sum;

  for (let i = 0; i < time; i++) {
    current += scale * deltas[i];
    this.positionQueue[side][component].push(current);
  }
};

Hands.prototype.bounceToY = function(side, target, time) {
  this.positionQueue[side].y = [];

  let sum = 0;
  const deltas = [];
  for (let i = 0; i < time; i++) {
    deltas.push(Math.sin(Math.PI / 2 + i * Math.PI / time));
    sum += Math.abs(deltas[i]);
  }

  const scale = target / sum;
  let y = 0;
  for (let i = 0; i < time; i++) {
    y += scale * deltas[i];
    this.positionQueue[side].y.push(y);
  }
};

// Returns true if valid, false if not
Hands.prototype.validateSiteswap = function() {
  // Check syntax
  // Find the type of pattern
  if (this.siteswap.match(/^[a-z\d]+$/))
    this.type = 'vanilla';
  else if (this.siteswap.match(/^([0-9a-z]*(\[[0-9a-z]{2,}\])+[0-9a-z]*)+$/))
    this.type = 'multiplex';
  else if (this.siteswap.match(/^(\([02468acegikmoqsuwy]x?,[02468acegikmoqsuwy]x?\))+\*?$/))
    this.type = 'synchronous';
  else if (this.siteswap.match(/^(\(([02468acegikmoqsuwyx]x?|\[[02468acegikminioqsuwyx]{2,}\]),([02468acegikmoqsuwy]x?|\[[02468acegikmoqsuwyx]{2,}\])\))+\*?$/))
    this.type = 'synchronous multiplex';
  else
    return false;

  // Only allow valid characters
  if (this.siteswap.match(/[^a-z0-9\[\]\(\)\,\*]/))
    return false;

  // Only allow commas in synchronous siteswaps
  if (this.siteswap.indexOf(',') > -1 && (this.type == 'vanilla' || this.type == 'multiplex'))
    return false;

  // Check correct use of asterisks and commas
  if (this.type == 'synchronous' || this.type == 'synchronous multiplex') {
    const asterisk = (this.siteswap.match(/\*/g) || []).length;
    if (asterisk > 1 || (asterisk == 1 && this.siteswap.substring(this.siteswap.length - 1, this.siteswap.length) != '*'))
      return false;
  } else {
    if (this.siteswap.indexOf(',') > -1)
      return false;
    else if (this.siteswap.indexOf('*') > -1)
      return false;
  }

  // Multiplex validation.
  if (this.siteswap.match(/\[[0-9a-z\(\),]*\[/)) // Nested
    return false;
  if (this.siteswap.match(/\[[0-9a-z\(\),]*($|\[)/)) // Opened not closed
    return false;
  if (this.siteswap.match(/(^|\])[0-9a-z\(\),]*\]/)) // Closed not opened
    return false;
  if (this.siteswap.match(/\[[0-9a-z]*[\(\)\,]+[0-9a-z]*\]/)) // Sync in mutliplex
    return false;
  if (this.siteswap.match(/\[[0-9a-z]?\]/)) // Only one throw in multiplex
    return false;

  // Sync validation
  if (this.type == 'synchronous' || this.type == 'synchronous multiplex') {
    const crossingEvens = (this.siteswap.match(/([02468acegikmoqsuwy]x)/) == null) ? 0 : this.siteswap.match(/([02468acegikmoqsuwy]x)/).length;
    const odds = (this.siteswap.match(/[13579bdfhjlnprtvxz]/) == null) ? 0 : this.siteswap.match(/[13579bdfhjlnprtvxz]/).length;
    if (odds > crossingEvens) // Only evenly weighted throws in synch this.siteswap
      return false;
    if (this.siteswap.match(/(^|\))[^\(\)\*]+(\(|\*|$)/)) // All throws must be enclosed within parentheses
      return false;
    if (this.siteswap.match(/\([0-9a-z\[\],]*($|\()/)) // Pair opened and not closed
      return false;
    if (this.siteswap.match(/(^|\))[0-9a-z\[\],]*\)/)) // Pair closed but not opened
      return false;
    if (this.siteswap.match(/\([^,]*\)/)) // Must be separated by a comma
      return false;
    if (this.siteswap.match(/\([0-9a-z\[\],]*,+[0-9a-z\[\],]*,+[0-9a-z\[\],]*\)/)) // Only two throws per pair
      return false;
    // Other sync error
    if (this.siteswap.match(/\((([0-9a-z\[\]]+\[[0-9a-z\(\),]*\])|(\[[0-9a-z\(\),]*\][0-9a-z\[\]]+)|([0-9a-z]{3})|([0-9a-z][^x,]))?,/) ||
      this.siteswap.match(/,(([0-9a-z\[\]]+\[[0-9a-z\(\),]*\])|(\[[0-9a-z\(\),]*\][0-9a-z\[\]]+)|([0-9a-z]{3})|([0-9a-z][^x,]))?\)/))
      return false;
  }

  // Start the real validation

  // Expand sync siteswap if it ends with an asterisk
  if (this.siteswap.indexOf('*') > -1) {
    this.siteswap = this.siteswap.substring(0, this.siteswap.length - 1);
    let working = this.siteswap;
    
    // Add on working, swapping the pairs around
    while (working.indexOf('(') > -1) {
      const openingBrace = working.indexOf('(');
      const comma = working.indexOf(',');
      const closingBrace = working.indexOf(')');

      this.siteswap += '(' + working.substring(comma + 1, closingBrace) + ',' + working.substring(openingBrace + 1, comma) + ')';
      working = working.substring(closingBrace + 1);
    }
  }

  // Double the pattern if the period is odd
  let double = false;
  if ((this.type == 'vanilla' && this.siteswap.length % 2 === 1) || (this.type == 'multiplex' && this.siteswap.replace(/\[\w+\]/g, '1').length % 2 === 1)) {
    double = true;
    this.siteswap += this.siteswap;
  }

  const self = this;
  function getValue(c) {
    const v = (c.match(/^[0-9]$/)) ? parseInt(c) : c.charCodeAt(0) - 87;
    if (v > self.max) self.max = v;
    return v;
  }

  // Get throws out
  let a = 0;
  let b = 0;
  let sync = 0;
  let inMultiplex = false;
  let hand = 0;

  for (let i = 0; i < this.siteswap.length; i++) {
    const char = this.siteswap.substring(i, i + 1);

    if (char == '(') sync = 1;
    else if (char == ',') sync = 2;
    else if (char == '[') inMultiplex = true;
    else if (char == ']') {
      inMultiplex = false;
      if (sync == 0) {
        a++;
        b++;
        hand++;
      }
      else if (sync == 1) a++;
      else b++;
    } else {
      if (this.left[a] == null) this.left[a] = [];
      if (this.right[b] == null) this.right[b] = [];
      if (char == ')') {
        sync = 0;
        this.left[a++][0] = new Throw(0);
        this.right[b++][0] = new Throw(0);
      } else {
        if (sync == 1) {
          let value = getValue(char);

          if (value % 2 === 0 && this.siteswap.substring(i + 1, i + 2) === 'x') {
            value *= -1;
            i++;
          }

          this.left[a].push(new Throw(value));

          if (!inMultiplex)
            a++;
        } 
        else if (sync == 2) {
          let value = getValue(char);

          if (value % 2 === 0 && this.siteswap.substring(i + 1, i + 2) === 'x') {
            value *= -1;
            i++;
          }

          this.right[b].push(new Throw(value));
          
          if (!inMultiplex)
            b++;
        } 
        else if (inMultiplex) {
          let value = getValue(char);
          if (value % 2 === 0 && this.siteswap.substring(i + 1, i + 2) === 'x') {
            value *= -1;
            i++;
          }

          if (hand % 2 == 0) {
            this.left[a][this.left[a].length] = new Throw(value);
            this.right[b][0] = new Throw(0);
          } else {
            this.right[b][this.right[b].length] = new Throw(value);
            this.left[a][0] = new Throw(0);
          }
        }
        else {
          if (hand++ % 2 == 0) {
            this.left[a++][0] = new Throw(getValue(char));
            this.right[b++][0] = new Throw(0);
          } else {
            this.right[b++][0] = new Throw(getValue(char));
            this.left[a++][0] = new Throw(0);
          }
        }
      }
    }
  }

  // Average rule
  let	sum = 0;
  let num = 0;
  for (let i = 0; i < this.left.length; i++) {
    for (let j = 0; j < this.left[i].length; j++) {
      sum += Math.abs(this.left[i][j].value);
    }
    num++;
  }

  for (let i = 0; i < this.right.length; i++) {
    for (let j = 0; j < this.right[i].length; j++) {
      sum += Math.abs(this.right[i][j].value);
    }
  }

  this.number = sum / num;

  if (double) num /= 2;
  if ((sum % num) != 0) return false;

  // See if number in matches number out for each throw/catch
  const outLeft = [];
  const outRight = [];
  const inLeft = [];
  const inRight = [];

  const period = this.left.length;

  for (let i = 0; i < period; i++) {
    inLeft[i] = 0;
    inRight[i] = 0;
  }

  for (let i = 0; i < period; i++) {
    // Count throws out for each beat
    outLeft[i] = (this.left[i][0].value === 0) ? 0 : this.left[i].length;
    outRight[i] = (this.right[i][0].value === 0) ? 0 : this.right[i].length;
    
    // Count catches in for each beat
    this.left[i].forEach(t => {
      if (t.value > 0 && t.value % 2 === 0) inLeft[(i + t.value) % period]++; // Same side
      else if (t.value !== 0) inRight[(i + Math.abs(t.value)) % period]++; // Crosses
    });
    
    this.right[i].forEach(t => {
      if (t.value > 0 && t.value % 2 === 0) inRight[(i + t.value) % period]++; // Same side
      else if (t.value !== 0) inLeft[(i + Math.abs(t.value)) % period]++; // Crosses
    });
  }

  for (let i = 0; i < period; i++) {
    if (inLeft[i] !== outLeft[i] || inRight[i] !== outRight[i]) return false;
  }

  return true;
};

Hands.prototype.initCatches = function() {
  this.catches = {
    left: [],
    right: []
  };

  // Init
  for (let i = 0; i < this.period; i++) {
    this.catches.left[i] = [];
    this.catches.right[i] = [];
  }

  // Add catches
  for (let i = 0; i < this.period; i++) {	
    this.left[i].forEach(t => {
      const index = (i + Math.abs(t.value)) % this.period;
      if (t.value === 0 || !t.active) return;
      if (t.value > 0 && t.value % 2 === 0) this.catches.left[index].push(t.value);
      else this.catches.right[index].push(Math.abs(t.value));
    });

    this.right[i].forEach(t => {
      const index = (i + Math.abs(t.value)) % this.period;
      if (t.value === 0 || !t.active) return;
      if (t.value > 0 && t.value % 2 === 0) this.catches.right[index].push(t.value);
      else this.catches.left[index].push(Math.abs(t.value));
    });
  }
};
/* jshint -W097 */
'use strict';

function HeadBounce(timeUnit, left, zeros, twos, style) {
  this.beatLength = 2;
  this.beatIndex = 0;
  this.beats = [];
  this.style = style;

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
  drawBall(ctx, x + this.x, y + this.y, scale, height, this.style, r);
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
};/* jshint -W097 */
'use strict';

function Juggler(options) {
  this.propType = options.propType;

  // Keeps track of where the hands should be and what throws need to be made
  this.hands = new Hands(options.siteswap);

  this.headStyle = options.styles.head;
  this.bodyStyle = options.styles.body;

  // Spin stuff
  this.spins = (options.spinOn0s || options.spinOn2s) && this.generateSpins(this.hands, options.spinOn0s, options.spinOn2s);
  this.spinIndex = 0;
  this.spinning = false;
  this.spinAmounts = [];
  this.spinAIndex = 0;
  this.spinRotation = 0;

  // How many frames between throws
  this.timeUnit = Math.round(options.fps / options.throwsPerSecond);

  // Head bounce & balance
  this.headBounce = options.headBounce ? new HeadBounce(this.timeUnit, this.hands.left, options.spinOn0s, options.spinOn2s, options.styles.headBounce) : false;
  this.clubBalance = options.clubBalance ? new ClubBalance(this.timeUnit, options.styles.clubBalance) : false;

  this.width = options.width;
  this.height = options.height;

  this.rotation = 0;

  // Try to fill the canvas nicely
  this.calculateScale(this.width, this.height);

  this.a = this.calculateAcceleration(this.scale * options.height / 16 * (2 * this.hands.max - 3), 0.5 * this.hands.max * this.timeUnit);

  if (this.propType !== 'b')
    this.scale *= 0.75;

  // Keeps track of the props being juggled
  this.props = new Props(this.propType, this.timeUnit, this.a, this.scale, this.height, this.hands, options.styles.props);

  // For knowing when to throw
  this.count = 1;

  this.patternLength = this.hands.left.length * this.timeUnit;
}

Juggler.prototype.update = function() {
  // Move hands
  let spinLength = -1;
  if (this.spinAmounts.length > 0 && this.spinAIndex === 0)
    spinLength = this.spinAmounts.length;

  this.hands.update(this.count, this.timeUnit, this.height, this.scale, spinLength);

  // Move body
  this.move();

  // Move props
  this.props.update();
  
  if (this.headBounce) this.headBounce.update(this.a);
  if (this.clubBalance) this.clubBalance.update(this.scale, this.height);

  // Make new throws
  if (this.count % this.timeUnit === 0) {
    const throws = this.hands.getNextThrows();

    this.props.makeThrows('left', throws.left, this.hands);
    this.props.makeThrows('right', throws.right, this.hands);
  }

  this.count++;
};

Juggler.prototype.draw = function(ctx) {
  ctx.lineWidth = 2;

  const centerX = this.width / 2;

  // Juggler
  const headBob = this.scale * this.height * Math.sin(this.count / (this.timeUnit / 2)) / 800;
  const headBounceRecoil = this.headBounce && this.headBounce.getHeadRecoil() * 10 * this.scale;

  if (this.rotation <= 90 || 270 < this.rotation) {
    this.drawBody(ctx, centerX, 9 * this.height / 10, this.rotation + this.spinRotation, headBob - headBounceRecoil);
  }

  const forehead = 9 * this.height / 10 - 41*(this.scale*this.height)/160;
  if (this.headBounce) {
    this.headBounce.draw(ctx, centerX, forehead, this.rotation, 2 * this.scale, this.height);
  }
   
  if (this.clubBalance) {
    this.clubBalance.draw(ctx, centerX, forehead + headBob - headBounceRecoil - this.scale * this.height/20, this.scale, this.height);
  }

  const propsY = 9 * this.height / 10 - (this.scale * this.height / 80);
  this.props.draw(ctx, centerX, propsY, this.rotation);

  if (90 < this.rotation && this.rotation <= 270) {
    this.drawBody(ctx, centerX, 9 * this.height / 10, this.rotation + this.spinRotation, headBob - headBounceRecoil);
  }
};

Juggler.prototype.move = function() {
  if (!this.spins) return;

  if (this.spinning) {
    this.spinRotation += this.spinAmounts[this.spinAIndex];

    if (++this.spinAIndex >= this.spinAmounts.length) {
      this.spinning = false;
    }
  }

  if (this.count % this.timeUnit === this.timeUnit / 2) {
    if (this.nextSpin) {
      this.startSpin(this.nextSpin);
      delete this.nextSpin;
    }
    else {
      const spin = this.spins[this.spinIndex];
      const type = spin && spin.type;
      if (type === 't') this.startSpin(spin);
      if (type === 'c') this.nextSpin = spin;
    }
    
    if (++this.spinIndex >= this.spins.length)
      this.spinIndex = 0;
  }
};

Juggler.prototype.startSpin = function(spin) {
  // How far to spin through
  const degrees = spin.turns * 360;
  // How long the spin will take
  let frames = 2 * spin.turns * this.timeUnit - 1;
  if (spin.type === 'c') frames -= this.timeUnit / 2;

  // Set defaults
  this.spinAmounts = [];
  this.spinAIndex = 0;

  let sum = 0;
  for (let i = 0; i < frames; i++) {
    this.spinAmounts[i] = Math.sin((i*Math.PI) / frames);
    sum += this.spinAmounts[i];
  }

  const scale = degrees / sum;

  for (let i = 0; i < frames; i++)
    this.spinAmounts[i] *= scale;

  this.spinning = true;
};

function Spin(type, turns) {
  this.type = type;
  this.turns = turns;
}

Juggler.prototype.generateSpins = (hands, spinOn0s, spinOn2s) => {
  let throwString = '';
  for (let i = 0; i < hands.period; i++) {
    const allThrows = hands.left[i].concat(hands.right[i]).map(t => {
      const v = Math.abs(t.value);
      return (v > 9) ? 9 : v;
    });
    throwString += Math.max(...allThrows);
  }

  let spinString = '';
  for (let i = 0; i < hands.period - 1; i++) {
    const candidate = throwString.slice(i, i + 2);

    if (spinOn2s && ['22', '20'].includes(candidate)) {
      spinString += 'c0';
      
      hands.left[i].concat(hands.right[i]).forEach(t => {
        if (t.value === 2) t.active = false;
      });
      hands.left[i + 1].concat(hands.right[i + 1]).forEach(t => {
        if (t.value === 2) t.active = false;
      });

      i++;
    }
    else if (spinOn0s && candidate === '00') {
      spinString += 't0';
      i++;
    }
    else {
      spinString += '0';
    }
  }

  const spins = [];
  for (let i = 0; i < hands.period; i++) {
    const type = spinString[i];
    
    if (type === '0') spins.push(false);
    else {
      spins.push(new Spin(type, 1));

      for (let j = i + 2; j < hands.period; j += 2) {
        const type = spinString[j];
        if (type === 't') {
          spins[i].turns++;
          spins.push(false);
          spins.push(false);
        }
        else break;
      }
      i = spins.length - 1;
    }
  }

  return spins;
};

Juggler.prototype.rotate = function(degrees) {
  this.rotation = (this.rotation + 360 + degrees) % 360;
};

Juggler.prototype.calculateScale = function(w, h) {
  // Max amount of screen to fill with the juggler and pattern
  const availableWidth = 0.9 * w;
  const availableHeight = 0.85 * h;

  this.scale = Math.abs(availableHeight / (h / 16 * (2 * this.hands.max - 3)));

  if ((h * this.scale) / 4 > availableWidth)
    this.scale = (4 * availableWidth) / h;
};

Juggler.prototype.calculateAcceleration = function(s, t) {
  return (2 * s) / (t * t);
};

Juggler.prototype.drawBody = function(ctx, x, y, r, headBob) {
  const pos = this.hands.positions;
  const props = this.props.props;
  const headMoveX = this.clubBalance && this.clubBalance.getHeadReaction();

  r %= 360;
  const h = this.scale * this.height / 4;
  const w = this.scale * this.height / 8;
  
  const yCos = Math.cos(r/180 * Math.PI);
  const ySin = Math.sin(r/180 * Math.PI);
  
  ctx.save();
  ctx.translate(x, y);
  
  // Head image
  // drawImage(ctx, headMoveX, -36*h/40 + headBob, 0, this.scale, 3.2*this.height, r, true);

  // Head
  ctx.fillStyle = this.headStyle.fill;
  ctx.strokeStyle = this.headStyle.stroke;
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

  let drawLeftArm = () => {
    const handX = yCos * (pos.left.x - 6*w/8) + ySin * h/3;
    const handY = -5*h/50 + pos.left.y;

    ctx.beginPath();
    ctx.strokeStyle = this.bodyStyle.stroke;
    ctx.moveTo(yCos * -w/2, -5*h/8);
    ctx.lineTo(yCos * (-pos.left.x/8 - 6*w/8), -h/7); // Elbow
    ctx.lineTo(handX, handY); // Hand
    ctx.stroke();

    // Props in left hand
    if (props.left.length) {
      const split = (this.propType === 'r') ? h/20 : (props.left.length === 1) ? 0 : pos.left.y;

      const startX = yCos * (pos.left.x - 6*w/8) + ySin * ((this.propType === 'r') ? h/2 : h/3); // - ((this.propType === 'r') ? (split / 2) : 0);
      const startY = handY - ((this.propType === 'r') ? 0 : (split / 2));

      for (let i = 0; i < props.left.length; i++) {
        const holdingX = startX + ((this.propType === 'r') ? i * (split / props.left.length) : 0);
        let holdingY = startY + ((this.propType === 'r') ? 0 : i * (split / props.left.length));

        let rotation = r;
        if (this.propType === 'c') {
          rotation = 270 - 0.5 * pos.left.y;
          holdingY += 0.5 * pos.left.y;
        } else if (this.propType === 'i') {
          rotation = props.left[0].r;
        }

        drawProp(ctx, this.propType, holdingX, holdingY, rotation, 0, this.scale, this.height, props.left[i].style);
        // props.left[i].draw(ctx, holdingX, holdingY, rotation, this.scale, this.height);
      }
    }
  };

  let drawRightArm = () => {
    const handX = yCos * (pos.right.x + 6*w/8) + ySin * h/3;
    const handY = -5*h/50 + pos.right.y;

    ctx.beginPath();
    ctx.strokeStyle = this.bodyStyle.stroke;
    ctx.moveTo(yCos * w/2, -5*h/8);
    ctx.lineTo(yCos * (6*w/8 - pos.right.x/8), -h/7); // Elbow
    ctx.lineTo(handX, handY); // Hand
    ctx.stroke();
    
    // Props in right hand
    if (props.right.length) {
      const split = (this.propType === 'r') ? h/20 : (props.right.length === 1) ? 0 : pos.right.y;
      
      const startX = yCos * (pos.right.x + 6*w/8) + ySin * ((this.propType === 'r') ? h/2 : h/3); //  - ((this.propType === 'r') ? (split / 2) : 0);
      const startY = handY - ((this.propType === 'r') ? 0 : (split / 2));

      for (let i = 0; i < props.right.length; i++) {

        const holdingX = startX + ((this.propType === 'r') ? i * (split / props.right.length) : 0);
        let holdingY = startY + ((this.propType === 'r') ? 0 : i * (split / props.right.length));

        let rotation = r;
        if (this.propType === 'c') {
          rotation = 270 - 0.5 * pos.right.y;
          holdingY += 0.5 * pos.right.y;
        } else if (this.propType === 'i') {
          rotation = props.right[0].r;
        }

        drawProp(ctx, this.propType, holdingX, holdingY, rotation, 0, this.scale, this.height, props.right[i].style);
        // props.right[i].draw(ctx, holdingX, holdingY, rotation, this.scale, this.height);
      }
    }
  };

  // TODO improve this
  drawRightArm = drawRightArm.bind(this);
  drawLeftArm = drawLeftArm.bind(this);

  if (r >= 180) {
    drawLeftArm();
  } else {
    drawRightArm();
  }
  
  // Body
  ctx.fillStyle = this.bodyStyle.fill;
  ctx.strokeStyle = this.bodyStyle.stroke;
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
    this.vr = 20 * (Math.random() - 0.5);
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
/* jshint -W097 */
'use strict';

function Props(type, timeUnit, a, scale, height, hands, styles) {
  this.type = type;
  this.timeUnit = timeUnit;
  this.a = a;
  this.scale = scale;
  this.height = height;
  
  this.props = {
    left: [], // Stack of props in left hand
    right: [], // Stack of props in right hand
    air: [],
  };

  this.init(hands, styles);
}

Props.prototype.init = function(hands, styles) {
  const numCatches = { left: {}, right: {} };

  let i = 0;
  let colorIndex = 0;
  
  // Run through the throws - rethrow until the number of balls in hands = number of props in pattern
  while (this.props.left.length + this.props.right.length < hands.number) {
    const index = i % hands.period;

    // Figure out how many props are thrown for the first time on this beat
    const newlyThrownLeft = this.countThrownProps(hands.left[index]) - (numCatches.left[i] || 0);
    const newlyThrownRight = this.countThrownProps(hands.right[index]) - (numCatches.right[i] || 0);

    // "Throw" the props
    hands.left[index].forEach(t => {
      const v = t.value;
      const j = i + Math.abs(v);

      if (v === 0) return;
      if (v > 0 && v % 2 === 0) numCatches.left[j] = (numCatches.left[j] || 0) + 1;
      else numCatches.right[j] = (numCatches.right[j] || 0) + 1;
    });

    hands.right[index].forEach(t => {
      const v = t.value;
      const j = i + Math.abs(v);

      if (v === 0) return;
      if (v > 0 && v % 2 === 0) numCatches.right[j] = (numCatches.right[j] || 0) + 1;
      else numCatches.left[j] = (numCatches.left[j] || 0) + 1;
    });

    // Create the newly thrown props
    for (let j = 0; j < newlyThrownLeft; j++) {
      this.props.left.unshift(new Prop(this.type, styles[colorIndex++ % styles.length]));
    }

    for (let j = 0; j < newlyThrownRight; j++) {
      this.props.right.unshift(new Prop(this.type, styles[colorIndex++ % styles.length]));
    }

    i++;
  }
};

Props.prototype.update = function() {
  for (let i in this.props.air) {
    const c = this.props.air[i].update(this.a);
    
    if (c !== 'none') {
      // Move prop from the "air" into the appropriate hand
      this.props[c] = this.props[c].concat(this.props.air.splice(i, 1));
    }
  }
};

Props.prototype.draw = function(ctx, x, y, r) {
  const order = (r < 180) ? 1 : -1;

  // z-ordering
  function compareZ(a, b) {
    if (a.x < b.x)
      return order;
    if (a.x > b.x)
      return -order;

    return 0;
  }

  this.props.air.sort(compareZ);
  this.props.air.forEach(prop => prop.draw(ctx, x, y, r, this.scale, this.height));
};

Props.prototype.makeThrows = function(side, throws, hands) {
  if (throws.length < 1) return;

  const multiplexSplit = 0.5;
  const multiplex = throws.length;
  let start = (multiplex > 1) ? -multiplexSplit / 2 : 0;

  // Distance from centre to outside throw position
  const w = this.height * this.scale / 8;

  for (let i = 0; i < multiplex; i++) {
    const t = throws[i];
    let ssValue = t.value;

    let cross = false;
    // Evens that cross are negative
    if (ssValue < 0) {
      cross = true;
      ssValue *= -1;
    }
    // Odd numbers cross
    else if (ssValue % 2 === 1)
      cross = true;

    let startX = (side === 'left') ? 3*w/4 - hands.positions.left.x : hands.positions.right.x + 3*w/4;
    let destX = w;

    if (cross) destX *= -1;

    if (side === 'left') {
      startX *= -1;
      destX *= -1;
    }

    const prop = this.props[side].pop();
    prop.throw(ssValue + start, startX, destX, this.timeUnit, this.a);
    this.props.air.push(prop);

    start += multiplexSplit / throws.length;
  }
};

Props.prototype.countThrownProps = (throws, onlyActiveThrows = false) => throws.filter(t => !onlyActiveThrows || t.active).map(t => 0 + !!t.value).reduce((acc, val) => acc + val, 0);
/* jshint -W097 */
'use strict';

function Throw(value) {
  this.value = value;
  this.active = true;
}
return SiteswapJS; })();

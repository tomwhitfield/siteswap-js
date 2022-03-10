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

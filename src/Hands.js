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
  this.holding = { left: 0, right: 0 };

  if (this.valid) {
    this.sync = this.type === 'synchronous' || this.type === 'synchronous multiplex';
    this.period = this.left.length;
    this.initCatches();
    this.initHolding();
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

Hands.prototype.getNextThrows = function(spinning) {
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

  this.holding.left -= this.countThrownProps(throws.left, true);
  this.holding.right -= this.countThrownProps(throws.right, true);

  // Advance indices.
  if (++this.leftIndex === this.left.length)
    this.leftIndex = 0;
  if (++this.rightIndex === this.right.length)
    this.rightIndex = 0;

  return throws;
};

Hands.prototype.makeCatches = function(catches) {
  this.holding.left += catches.left;
  this.holding.right += catches.right;
};

Hands.prototype.getHolding = function(spinning) {
  return {
    left: this.holding.left,
    right: this.holding.right,
    spinning: spinning,
  };
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
  else if (this.siteswap.match(/^(\(([02468acegikmoqsuwyx]x?|\[[02468acegikmoqsuwyx]{2,}\]),([02468acegikmoqsuwy]x?|\[[02468acegikmoqsuwyx]{2,}\])\))+\*?$/))
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

Hands.prototype.countThrownProps = (throws, onlyActiveThrows = false) => throws.filter(t => !onlyActiveThrows || t.active).map(t => 0 + !!t.value).reduce((acc, val) => acc + val, 0);

Hands.prototype.initHolding = function() {
  const numCatches = { left: {}, right: {} };

  // Run through the throws - rethrows until holding.left + holding.right = number
  let count = 0;
  while (this.holding.left + this.holding.right < this.number) {
    const i = count;
    const index = i % this.period;

    this.holding.left += this.countThrownProps(this.left[index]) - (numCatches.left[i] || 0);
    this.holding.right += this.countThrownProps(this.right[index]) - (numCatches.right[i] || 0);

    this.left[index].forEach(t => {
      const v = t.value;
      const j = i + Math.abs(v);

      if (v === 0) return;
      if (v > 0 && v % 2 === 0) numCatches.left[j] = (numCatches.left[j] || 0) + 1;
      else numCatches.right[j] = (numCatches.right[j] || 0) + 1;
    });

    this.right[index].forEach(t => {
      const v = t.value;
      const j = i + Math.abs(v);

      if (v === 0) return;
      if (v > 0 && v % 2 === 0) numCatches.right[j] = (numCatches.right[j] || 0) + 1;
      else numCatches.left[j] = (numCatches.left[j] || 0) + 1;
    });

    count++;
  }
};

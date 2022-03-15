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

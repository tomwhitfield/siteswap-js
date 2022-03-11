/* jshint -W097 */
'use strict';

function Props(type, timeUnit, a, scale, height, holding, styles) {
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

  for (let i = holding.left - 1; i >= 0 ; i--) {
    const style = styles[(i * 2) % styles.length];
    this.props.left.push(new Prop(this.type, style));
  }

  for (let i = holding.right - 1; i >= 0; i--) {
    const style = styles[(i * 2 + 1) % styles.length];
    this.props.right.push(new Prop(this.type, style));
  }
}

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
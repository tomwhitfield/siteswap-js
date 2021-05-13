/* jshint -W097 */
'use strict';

function Props(type, timeUnit, a, scale, height) {
  this.type = type;
  this.timeUnit = timeUnit;
  this.a = a;
  this.scale = scale;
  this.height = height;
  this.props = [];
}

Props.prototype.update = function() {
  const catches = { left: 0, right: 0 };

  for (let i in this.props) {
    const c = this.props[i].update(this.a);
    if (c !== 'none') {
      this.props.splice(i, 1);
      catches[c]++;
    }
  }

  return catches;
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

  this.props.sort(compareZ);
  this.props.forEach(prop => prop.draw(ctx, x, y, r, this.scale, this.height));
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

    this.props.push(new Prop(this.type, ssValue + start, startX, destX, this.timeUnit, this.a));

    start += multiplexSplit / throws.length;
  }
};
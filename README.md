# SiteswapJS #

A Javascript library for siteswap juggling animations.

### Example Animations

![](example_gifs/example1.gif)
![](example_gifs/example2.gif)
![](example_gifs/example3.gif)

### Development

After cloning this repo, run `npm install`, then `npm start` to run a local server with the animator in a sandbox on `http://localhost:7531/`.

### Usage

Include `ss.js` or `ss.min.js` in your project and then:

```
animator = new SiteswapJS(canvasId, siteswap, options);
animator.start();
```

Where `canvasId` in the id of a HTML canvas, `siteswap` is a string of the siteswap to animate and `options` is an object with properties from:

Option | Type | Default | Description
--- | --- | --- | ---
`propType` | `b`, `c` or `r` | b | Which prop to use: b = balls, c = clubs, r = rings
`throwsPerSecond` | Float | 3 | How many beats per second
`headBounce` | Boolean | `false` | Whether the juggler should be performing a headbounce
`clubBalance` | Boolean | `false` | Whether the juggler should be performing a club balance
`spinOn0s` | Boolean | `false` | When `true`, the juggler pirouettes 360 degrees for each two consecutive 0 beats
`spinOn2s` | Boolean | `false` | When `true`, the juggler pirouettes 360 degrees for each two consecutive 2 beats
`debug` | Boolean | `false` | When `true`, shows additional debugging information on the canvas
`controls` | Boolean | `false` | Whether to add mouse and touch listeners to the canvas for rotating the juggler
`styles` | Object | See "Default Styles" below | Customises the styles of the props and juggler. Can be partially or fully overwritten. `props` is an array of style objects, with each initially thrown prop taking the next style defined in the array or wrapping back around to the start if there isn't one

### Default Styles

```
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
```

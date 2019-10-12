// import the necessary modules
const { Illustration, Shape, Cylinder, Hemisphere, TAU, Group, Anchor } = Zdog;

// target the canvas in which to add the drawing
const element = document.querySelector('canvas');
const illustration = new Illustration({
  element,
});

// translate the entire drawing downwards to avoid cropping and position the chicken at the bottom of the canvas
const anemometer = new Group({
  addTo: illustration,
  translate: {
    y: 80,
  },
});

// base
new Cylinder({
  addTo: anemometer,
  diameter: 80,
  length: 20,
  stroke: false,
  color: 'hsl(215, 95%, 5%)',
  rotate: {
    x: TAU / 4,
  },
});

new Shape({
  addTo: anemometer,
  path: [{ x: 0, y: 0 }, { x: 0, y: -30 }],
  stroke: 20,
  color: 'hsl(215, 95%, 5%)',
});

// anchor from which to rotate the shapes
const fulcrum = new Anchor({
  addTo: anemometer,
  translate: {
    y: -30,
  },
});

const chicken = new Group({
  addTo: fulcrum,
});

// draw a chicken-like figure with curve commands
new Shape({
  addTo: chicken,
  path: [
    { x: 0, y: 0 },
    { arc: [{ x: -50, y: -10 }, { x: -50, y: -50 }] },
    { arc: [{ x: -70, y: -50 }, { x: -70, y: -26 }] },
    { arc: [{ x: -70, y: -66 }, { x: -60, y: -66 }] },
    { arc: [{ x: -90, y: -66 }, { x: -90, y: -46 }] },
    { bezier: [{ x: -85, y: -91 }, { x: -5, y: -91 }, { x: 0, y: -46 }] },
    { arc: [{ x: 20, y: -46 }, { x: 30, y: -86 }] },
    { arc: [{ x: 30, y: -102 }, { x: 20, y: -102 }] },
    { arc: [{ x: 50, y: -102 }, { x: 50, y: -86 }] },
    { x: 65, y: -71 },
    { x: 50, y: -56 },
    { arc: [{ x: 50, y: 0 }, { x: 0, y: 0 }] },
  ],
  stroke: 25,
  fill: 'hsl(180, 60%, 85%)',
  color: 'hsl(180, 60%, 85%)',
});

// draw one eye with a rotated hemisphere
// as the shape is not meant to rotate all the way, there's no need for the eye to appear on both sides of the shape
const eye = new Hemisphere({
  addTo: chicken,
  stroke: false,
  diameter: 15,
  color: 'hsl(215, 95%, 5%)',
  backface: 'hsl(180, 60%, 85%)',
  translate: {
    x: 50,
    y: -75,
    z: 12.5,
  },
});

// draw a snow flake which is repeated around the chicken
const flake1 = new Group({
  // add to the fulcrum to have the flakes rotate with the same rhythm
  addTo: fulcrum,
  translate: {
    x: 50,
    y: -50,
    z: -50,
  },
});

// lines created for the individual snow flake
const branch = new Group({
  addTo: flake1,
});

new Shape({
  addTo: branch,
  path: [{ x: 0, y: 0 }, { x: 0, y: -15 }],
  stroke: 3,
  color: 'hsl(200, 70%, 55%)',
});
new Shape({
  addTo: branch,
  path: [{ x: 0, y: -4 }, { x: 5, y: -8 }],
  stroke: 3,
  color: 'hsl(200, 70%, 55%)',
});
new Shape({
  addTo: branch,
  path: [{ x: 0, y: -4 }, { x: -5, y: -8 }],
  stroke: 3,
  color: 'hsl(200, 70%, 55%)',
});

new Shape({
  addTo: branch,
  path: [{ x: 0, y: -10 }, { x: 4, y: -12 }],
  stroke: 3,
  color: 'hsl(200, 70%, 55%)',
});
new Shape({
  addTo: branch,
  path: [{ x: 0, y: -10 }, { x: -4, y: -12 }],
  stroke: 3,
  color: 'hsl(200, 70%, 55%)',
});

// use copyGraph to copy every line
branch.copyGraph({
  rotate: {
    z: TAU / 4,
  },
});
branch.copyGraph({
  rotate: {
    z: (TAU / 4) * 3,
  },
});
branch.copyGraph({
  rotate: {
    z: TAU / 2,
  },
});

// copy the snow flake and move it around the chicken
// ! the individual reference is so the flakes can be animated individually
const flake2 = flake1.copyGraph({
  translate: {
    x: -80,
    z: -50,
  },
  scale: 1.05,
});
const flake3 = flake1.copyGraph({
  translate: {
    x: 100,
    y: -50,
    z: 60,
  },
  scale: 0.95,
});
const flake4 = flake1.copyGraph({
  translate: {
    x: -50,
    y: -50,
    z: 100,
  },
  scale: 0.9,
});
const flake5 = flake1.copyGraph({
  translate: {
    x: -80,
    y: -100,
    z: -50,
  },
  scale: 1.1,
});

const flakes = [flake1, flake2, flake3, flake4, flake5];

// rotate the shape around the fulcrum
// include a variable to flip the rotation
let direction = 1;
// include a boolean to stop the animation on click
let isAnimated = true;

function animate() {
  illustration.updateRenderGraph();
  requestAnimationFrame(animate);

  if (isAnimated) {
    fulcrum.rotate.y += 0.001 * direction;
    if (fulcrum.rotate.y >= TAU / 8 || fulcrum.rotate.y < -TAU / 12) {
      direction *= -1;
    }
    // rotate the flakes with different rates of change
    flakes.forEach((flake, index) => {
      flake.rotate.y += 0.002 * index;
      flake.rotate.x -= 0.001 * (flakes.length - index);
    });
  }
}

animate();

// on click toggle the boolean to stop the animation
element.addEventListener('click', () => {
  isAnimated = !isAnimated;
});

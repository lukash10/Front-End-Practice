// input data
const data = [
  {
    name: 'Public Sale',
    percentage: 20, // percentage
    value: 80, // millions
    color: '#0789F8',
  },
  {
    name: 'Reserved',
    percentage: 35,
    value: 140,
    color: '#F9BA00',
  },
  {
    name: 'Advisors',
    percentage: 10,
    value: 40,
    color: '#FE8C00',
  },
  {
    name: 'Foundation',
    percentage: 10,
    value: 40,
    color: '#A6A8F8',
  },
  {
    name: 'Option pool',
    percentage: 12.5,
    value: 50,
    color: '#47D7A8',
  },
  {
    name: 'Team Tokens',
    percentage: 12.5,
    value: 50,
    color: '#3BCB60',
  },
];

// retrieve the svg in which to plot the viz
const svg = d3.select('svg');

// identify the dimensions of the viewBox to establish the svg canvas
const viewBox = svg.attr('viewBox');
const regexViewBox = /\d+ \d+ (\d+) (\d+)/;
// ! .match() returns string values
const [, viewBoxWidth, viewBoxHeight] = viewBox
  .match(regexViewBox)
  .map(item => Number.parseInt(item, 10));

// with the margin convention include a group element translated within the svg canvas
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
// compute the width and height of the actual viz from the viewBox dimensions and considering the margins
// this to later work with width and height attributes directly through the width and height variables
const width = viewBoxWidth - (margin.left + margin.right);
const height = viewBoxHeight - (margin.top + margin.bottom);

// compute the radius as half the minor size between the width and height
const radius = Math.min(width, height) / 2;
// initialize a variable to have the multiple elements share the same stroke-width property
const strokeWidth = 10;

const group = svg
  .append('g')
  .attr('transform', `translate(${margin.left} ${margin.top})`);

// DEFAULT CIRCLE
// circle used as a background for the colored donut chart
// add a group to center the circle in the canvas (this to rotate the circle from the center)
const groupDefault = group
  .append('g')
  .attr('transform', `translate(${width / 2} ${height / 2})`);

// append the circle showing only the stroke
groupDefault
  .append('circle')
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r', radius)
  .attr('transform', 'rotate(-90)')
  .attr('fill', 'none')
  .attr('stroke', 'hsla(0, 0%, 0%, 0.08')
  .attr('stroke-width', strokeWidth)
  .attr('stroke-linecap', 'round');

// COLORED CIRCLES
// pie function to compute the arcs
const pie = d3
  .pie()
  .sort(null)
  .padAngle(0.12)
  // use either the value or the percentage in the dataset
  .value(d => d.value);

// arc function to create the d attributes for the path elements
const arc = d3
  .arc()
  // have the arc overlaid on top of the stroke of the circle
  .innerRadius(radius)
  .outerRadius(radius);

/* for each data point include the following structure
g             // wrapping all arcs
  g           // wrapping each arc
    arc       // actual shape
    line      // connecting line
    text      // text label
  g
    arc
    ...
*/
// wrapping group, horizontally centered
const groupArcs = group
  .append('g')
  .attr('transform', `translate(${width / 2} ${height / 2})`);

const groupsArcs = groupArcs
  .selectAll('g')
  .data(pie(data))
  .enter()
  .append('g');

// include the arcs specifying the stroke with the same width of the circle element
groupsArcs
  .append('path')
  .attr('class', 'arc')
  .attr('d', arc)
  .attr('fill', 'none')
  .attr('stroke', d => d.data.color)
  .attr('stroke-width', strokeWidth * 0.8)
  .attr('stroke-linecap', 'round')
  .attr('stroke-linejoin', 'round');

// include lines visually connecting the text labels with the arcs
groupsArcs
  .append('path')
  .attr('class', 'line')
  .attr('d', d => {
    const [x] = arc.centroid(d);
    const h = x > 0 ? 20 : -20;
    return `M 0 0 H ${h}`;
  })
  .attr('stroke', ({ data: d }) => d.color)
  .attr('stroke-width', 1.5)
  .attr('transform', d => {
    const [x, y] = arc.centroid(d);
    const offset = x > 0 ? 20 : -20;
    return `translate(${x + offset} ${y})`;
  });

// include text elements associated with the arcs
groupsArcs
  .append('text')
  .attr('x', 0)
  .attr('y', 0)
  .attr('font-size', 8)
  .attr('text-anchor', d => {
    const [x] = arc.centroid(d);
    return x > 0 ? 'start' : 'end';
  })
  .attr('transform', d => {
    const [x, y] = arc.centroid(d);
    const offset = x > 0 ? 50 : -50;
    return `translate(${x + offset} ${y})`;
  })
  .html(
    ({ data: d }) => `
    <tspan x="0">${d.name}:</tspan><tspan x="0" dy="10" font-size="6">${
      d.percentage
    }% / ${d.value}M</tspan>
  `
  );

// TRANSITIONS
// initial state
// hide the strokes and text elements
groupDefault
  .select('circle')
  .attr('stroke-dasharray', function() {
    return this.getTotalLength();
  })
  .attr('stroke-dashoffset', function() {
    return this.getTotalLength();
  });

groupArcs
  .selectAll('path.arc')
  .attr('stroke-dasharray', function() {
    return this.getTotalLength();
  })
  .attr('stroke-dashoffset', function() {
    return this.getTotalLength();
  });

groupArcs
  .selectAll('path.line')
  .attr('stroke-dasharray', function() {
    return this.getTotalLength();
  })
  .attr('stroke-dashoffset', function() {
    return this.getTotalLength();
  });

groupArcs
  .selectAll('text')
  .style('opacity', 0)
  .style('visibility', 'hidden');

// actual transition
// draw the stroke of the larger circle element
groupDefault
  .select('circle')
  .transition()
  .ease(d3.easeExp)
  .delay(200)
  .duration(2000)
  .attr('stroke-dashoffset', '0')
  // once the transition is complete
  // draw the smaller strokes one after the other
  .on('end', () => {
    const duration = 1000;
    // transition the arcs to stroke-dashoffset 0
    groupArcs
      .selectAll('path.arc')
      .transition()
      .ease(d3.easeLinear)
      .delay((d, i) => i * duration)
      .duration(duration)
      .attr('stroke-dashoffset', 0);

    // transition the lines to stroke-dashoffset 0
    groupArcs
      .selectAll('path.line')
      .transition()
      .ease(d3.easeLinear)
      .delay((d, i) => i * duration + duration / 2.5)
      .duration(duration / 3)
      .attr('stroke-dashoffset', 0);

    // transition the text elements to opacity 1 and visibility visible
    groupArcs
      .selectAll('text')
      .transition()
      .ease(d3.easeLinear)
      .delay((d, i) => i * duration + duration / 2)
      .duration(duration / 2)
      .style('opacity', 1)
      .style('visibility', 'visible');
  });

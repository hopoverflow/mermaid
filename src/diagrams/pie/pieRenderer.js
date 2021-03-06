/**
 * Created by AshishJ on 11-09-2019.
 */
import { select, scaleOrdinal, schemeSet2, pie as d3pie, entries, arc } from 'd3';
import pieData from './pieDb';
import pieParser from './parser/pie';
import { log } from '../../logger';
import { configureSvgSize } from '../../utils';

const conf = {};
export const setConf = function(cnf) {
  const keys = Object.keys(cnf);

  keys.forEach(function(key) {
    conf[key] = cnf[key];
  });
};

/**
 * Draws a Pie Chart with the data given in text.
 * @param text
 * @param id
 */
let width;
const height = 450;
export const draw = (txt, id) => {
  try {
    const parser = pieParser.parser;
    parser.yy = pieData;
    log.debug('Rendering info diagram\n' + txt);
    // Parse the Pie Chart definition
    parser.yy.clear();
    parser.parse(txt);
    log.debug('Parsed info diagram');
    const elem = document.getElementById(id);
    width = elem.parentElement.offsetWidth;

    if (typeof width === 'undefined') {
      width = 1200;
    }

    if (typeof conf.useWidth !== 'undefined') {
      width = conf.useWidth;
    }

    const diagram = select('#' + id);
    configureSvgSize(diagram, height, width, conf.useMaxWidth);

    // Set viewBox
    elem.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    // Fetch the default direction, use TD if none was found
    var margin = 40;
    var legendRectSize = 18;
    var legendSpacing = 4;

    var radius = Math.min(width, height) / 2 - margin;

    var svg = diagram
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    var data = pieData.getSections();
    var sum = 0;
    Object.keys(data).forEach(function(key) {
      sum += data[key];
    });

    // Set the color scale
    var color = scaleOrdinal()
      .domain(data)
      .range(schemeSet2);

    // Compute the position of each group on the pie:
    var pie = d3pie().value(function(d) {
      return d.value;
    });
    var dataReady = pie(entries(data));

    // Shape helper to build arcs:
    var arcGenerator = arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Build the pie chart: each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('mySlices')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', function(d) {
        return color(d.data.key);
      })
      .attr('stroke', 'black')
      .style('stroke-width', '2px')
      .style('opacity', 0.7);

    // Now add the percentage.
    // Use the centroid method to get the best coordinates.
    svg
      .selectAll('mySlices')
      .data(dataReady.filter(value => value.data.value !== 0))
      .enter()
      .append('text')
      .text(function(d) {
        return ((d.data.value / sum) * 100).toFixed(0) + '%';
      })
      .attr('transform', function(d) {
        return 'translate(' + arcGenerator.centroid(d) + ')';
      })
      .style('text-anchor', 'middle')
      .attr('class', 'slice')
      .style('font-size', 17);

    svg
      .append('text')
      .text(parser.yy.getTitle())
      .attr('x', 0)
      .attr('y', -(height - 50) / 2)
      .attr('class', 'pieTitleText');

    // Add the legends/annotations for each section
    var legend = svg
      .selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = (height * color.domain().length) / 2;
        var horz = 12 * legendRectSize;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend
      .append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color);

    legend
      .append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) {
        return d;
      });
  } catch (e) {
    log.error('Error while rendering info diagram');
    log.error(e);
  }
};

export default {
  setConf,
  draw
};

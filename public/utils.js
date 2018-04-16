import d3 from 'd3';

const red = '#ff4e61';
const yellow = '#ffef7d';
const green = '#32c77c';
const colors = [red, yellow, green];
const formatTypes = {
  undefined: (d) => d,
  custom: d3.time.format('%Y/%m/%d %H:%M:%S'),
  auto: d3.time.format('%Y/%m/%d %H:%M:%S'),
  ms: d3.time.format('%Y/%m/%d %H:%M:%S,%L'),
  s: d3.time.format('%Y/%m/%d %H:%M:%S'),
  m: d3.time.format('%Y/%m/%d %H:%M'),
  h: d3.time.format('%Y/%m/%d %H:%M'),
  d: d3.time.format('%Y/%m/%d'),
  w: d3.time.format('%Y/%m/%d'),
  M: d3.time.format('%Y/%m'),
  y: d3.time.format('%Y')
};

export const round = (v) => Math.round(v * 100) / 100;
export const cumulativeFn = (d) => d.cumulativeValue;
export const absoluteFn = (d) => d.value;
export const getFormatTypes = ($vis) => formatTypes[getDateHistogram($vis)];

export function showTable($vis, mapColors, element, measures, data, valueFn, formatTime) {
  let minMaxesForColumn = [];
  const periodMeans = d3.nest().key((d) => d.period)
  .entries(data).map((d) => {
    const minMax = d3.extent(d.values, valueFn);
    const mean = round(d3.mean(d.values, valueFn));
    const minMaxObj = {
      min: minMax[0],
      max: minMax[1],
      mean: mean
    };
    minMaxesForColumn.push(minMaxObj);
    return mean;
  });

  const customColumn = getDateHistogram($vis) ? 'Date' : 'Term';
  const fixedColumns = ['Total', customColumn];
  const columns = d3.map(data, (d) => d.period).keys().map(x => parseInt(x, 10));
  const allColumns = fixedColumns.concat(columns);

  const table = d3.select(element).append('table')
  .attr('width', measures.width)
  .attr('class', 'cohort_table');

  const thead = table.append('thead');
  const tbody = table.append('tbody');
  const tfoot = table.append('tfoot');

  thead.append('tr')
  .selectAll('th')
  .data(allColumns)
  .enter()
  .append('th')
  .text((column) => column);

  const groupedData = d3.nest().key((d) => formatTime(d.date)).entries(data);
  const rows = tbody.selectAll('tr')
  .data(groupedData)
  .enter()
  .append('tr');

  const colorScale = getColorScale(mapColors, data, valueFn);

  rows.selectAll('td')
  .data((row) => {
    const date = row.key;
    let total = 0;
    const vals = columns.map((period) => {
      const d = row.values.find((d) => period === d.period);
      if (d) {
        total = round(d.total);
        return valueFn(d);
      }
    });

    return [total, date].concat(vals);
  })
  .enter()
  .append('td')
  .style('background-color', (d, i) => {
    if (i >= 2) { // skip first and second columns
      return colorScale(d, minMaxesForColumn[i - 2]);
    }
  })
  .text((d) => d);

  const meanOfMeans = round(d3.mean(periodMeans, (meanObj) => meanObj));
  const meanOfMeansTittle = `Mean (${meanOfMeans})`;
  const allMeans = ['-', meanOfMeansTittle].concat(periodMeans);

  tfoot.append('tr')
  .selectAll('td')
  .data(allMeans)
  .enter()
  .append('td')
  .text((d) => d);
}

export function showGraph(percentual, element, measures, data, valueFn, formatTime) {
  const svg = d3.select(element)
  .append('svg')
  .attr('width', measures.allWidth)
  .attr('height', measures.allHeight);

  const g = svg.append('g').attr('transform', `translate(${measures.margin.left}, ${measures.margin.top})`);

  const x = d3.scale.linear().range([0, measures.width]);
  const y = d3.scale.linear().range([measures.height, 0]);
  const z = d3.scale.category20();

  const line = d3.svg.line()
  // .curve(d3.curveBasis)
  .x((d) => x(d.period))
  .y((d) => y(valueFn(d)));

  const xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom').ticks(5);

  const yAxis = d3.svg.axis()
  .scale(y)
  .orient('left').ticks(5);

  const tooltip = d3.select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

  x.domain(d3.extent(data, (d) => d.period));
  y.domain([0, d3.max(data, valueFn)]);

  const dataNest = d3.nest()
  .key((d) => formatTime(d.date))
  .entries(data);

  z.domain(dataNest.map((d) => d.key));

  g.selectAll('dot_x')
  .data(data)
  .enter()
  .append('circle')
  .attr('r', 5)
  .attr('cx', (d) => x(d.period))
  .attr('cy', (d) => y(valueFn(d)))
  .style('fill', (d) => z(formatTime(d.date)))
  .style('opacity', 1)
  .on('mouseover', (d) => {
    tooltip.transition()
    .duration(100)
    .style('opacity', .9);

    tooltip.html(`${formatTime(d.date)} ( ${d.period} )<br/>${round(valueFn(d))}`)
    .style('background', z(formatTime(d.date)))
    .style('left', `${(d3.event.pageX + 5)}px`)
    .style('top', `${(d3.event.pageY - 35)}px`);
  })
  .on('mouseout', () => {
    tooltip.transition()
    .duration(500)
    .style('opacity', 0);
  });

  g.append('g')
  .attr('class', 'axis axis--x')
  .attr('transform', `translate(0, ${measures.height})`)
  .call(xAxis);

  g.append('g')
  .attr('class', 'axis axis--y')
  .call(yAxis)
  .append('text')
  .attr('y', 6)
  .attr('x', 6)
  .attr('dy', '.45em')
  .style('font', '10px sans-serif')
  .style('text-anchor', 'start')
  .text(percentual ? 'Percentual %' : 'Total Count');

  const cohortDate = g.selectAll('.cohortDate')
  .data(dataNest)
  .enter()
  .append('g')
  .attr('class', 'cohortDate');

  cohortDate.append('path')
  .attr('class', 'cohort_line')
  .attr('d', (d) => line(d.values))
  .style('stroke', (d) => z(d.key));

  const legend = g.append('g')
  .attr('class', 'legend')
  .attr('x', 10)
  .attr('y', 35)
  .attr('height', 100)
  .attr('width', 100);

  legend.selectAll('rect')
  .data(dataNest)
  .enter()
  .append('rect')
  .attr('x', 10)
  .attr('y', (d, i) => i * 20 + 20)
  .attr('width', 10)
  .attr('height', 10)
  .style('fill', (d) => z(d.key));

  legend.selectAll('text')
  .data(dataNest)
  .enter()
  .append('text')
  .attr('x', 30)
  .attr('y', (d, i) => i * 20 + 28)
  .style('font', '10px sans-serif')
  .text((d) => d.key);
}

export function getValueFunction({cumulative, percentual, inverse}) {
  const valueFn = cumulative ? cumulativeFn : absoluteFn;
  const percentFn = (d) => round((valueFn(d) / d.total) * 100);
  const inverseFn = (d) => round(100 - (valueFn(d) / d.total) * 100);

  if (percentual) {
    if (inverse) {
      return inverseFn;
    } else {
      return percentFn;
    }
  }

  return valueFn;
}

export function getDateHistogram($vis) {
  const schema = $vis.aggs.find((agg) => agg.schema.name === 'cohort_date');
  if (schema && schema.type.name === 'date_histogram') {
    return schema.params.interval.val;
  }
}

export function getHeatMapColor(data, valueFn) {
  const domain = d3.extent(data, valueFn);
  domain.splice(1, 0, d3.mean(domain));
  return d3.scale.linear().domain(domain).range(colors);
}

export function getMeanColor(d, column) {
  return d3.scale.linear().domain([column.min, column.mean, column.max]).range(colors)(d);
}

export function getAboveAverageColor(d, column) {
  if (d > column.mean) {
    return green;
  } else if (d === column.mean) {
    return yellow;
  } else if (d < column.mean) {
    return red;
  }
}

export function getColorScale(mapColors, data, valueFn) {
  if (mapColors === 'heatmap') {
    return getHeatMapColor(data, valueFn);
  } else if (mapColors === 'mean') {
    return getMeanColor;
  } else if (mapColors === 'aboveAverage') {
    return getAboveAverageColor;
  } else {
    return (d) => {
    };
  }
}

export function processData(esData, $vis) {
  const data = esData.tables[0].rows.map((row) => {
    const dateHistogram = getDateHistogram($vis);
    return {
      date: dateHistogram ? new Date(row[0]) : row[0],
      total: row[1],
      period: row[2],
      value: row[3]
    };
  });

  let cumulativeData = {};
  return data.map((d) => {
    const lastValue = cumulativeData[d.date] || 0;
    d.cumulativeValue = lastValue + d.value;
    cumulativeData[d.date] = d.cumulativeValue;
    return d
  });
}

var margin = { top: 20, right: 20, bottom: 30, left: 20 },
    width = 150 - margin.left - margin.right,
    height = 130 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(.1);

// Scales
var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(3);

function thousandPoint(k) {
    return d3.format(',')(k).replace(',', '.');
}

// csv loaded asynchronously
d3.csv('data/aerzte_versorgungsbericht_bearbeitet.csv', function(data) {
    data.pop = parseInt(data.pop);
    data.count = parseInt(data.count);
    data.mean = parseFloat(data.mean);

    // Data is nested by city
    var cities = d3.nest()
        .key(function(d) { return d.city; })
        .entries(data);

    // Compute the domains.
    x.domain(data.map(function(d) { return d.type; }));
    y.domain([0, 2.9]);

    // Add an SVG element for each city, with the desired dimensions and margin.
    var svg = d3.select('#vis').selectAll('svg')
        .data(cities)
        .enter()
        .append('svg:svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('text')
        .attr('class', 'city')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -2)
        .text(function(d) { return d.key; });

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', 12)
        .text(function(d) { return '(' + thousandPoint(d.values[0].pop) + ' Einwohner)'; });

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Accessing nested data:
    svg.selectAll('.bar')
        .data(function(d) { return d.values; })
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.type); })
        .attr('width', x.bandwidth())
        .attr('y', function(d) { return y(d.mean); })
        .attr('height', function(d) { return height - y(d.mean); })
        .attr('fill', function(d) {
            if (d.type === 'FA') {
                return '#74a9cf';
            } else if (d.type === 'HA') {
                return '#0570b0';
            } else if (d.type === 'ZA') {
                return '#023858';
            }
        });
});
function drawScatter() {
    var scatter = d3.select('#scatter');
    var scatterHeadline = scatter.append('h2')
        .text('Hausarztdichte und Durchschnittsalter der Gemeinden');
    var dropDown = scatter.append('div')
        .attr('id', 'filter')
        .append("select")
        .attr("name", "gemeinde-list");
    var margin = { top: 20, right: 30, bottom: 30, left: 30 },
        scatterWidth = parseFloat(scatter.style('width')) - margin.left - margin.right,
        scatterHeight = getHeight() - margin.top - margin.bottom;
    var x = d3.scaleLinear()
        .range([0, scatterWidth]);
    var y = d3.scaleLinear()
        .range([scatterHeight, 20]);
    var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(5);
    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(4);

    var svg = scatter
        .append("svg")
        .attr("width", scatterWidth + margin.left + margin.right)
        .attr("height", scatterHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    d3.csv('data/aerzte_versorgungsbericht_bearbeitet.csv', function drawScatterPlot(error,
        rawdata) {
        if (error) throw error;
        var data = [];
        rawdata.forEach(function(d) {
            if (d.type == 'HA') {
                data.push(d);
            }
        });
        data.forEach(function(d) {
            d.median = parseInt(d.median);
            d.mean = +d.mean;
            d.pop = +d.pop;
            d.label = d.label;
        });
        x.domain(d3.extent(data, function(d) { return d.mean; })).nice();
        y.domain([d3.min(data, function(d) { return d.median; }) - 1, d3.max(data,
            function(d) { return d.median; }) + 1]).nice();
        svg.append("g")
            .attr("class", "scatter__axis")
            .attr("transform", "translate(0," + scatterHeight + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "scatter__axis")
            .call(yAxis);
        var gdots = svg.selectAll(".dot")
            .data(data)
            .enter(); //.append("g").attr('class', 'circles');
        gdots.append('circle')
            .attr("class", "dot")
            .attr('name', function(d) {
                return d.city;
            })
            .attr('EW', function(d) {
                return d.pop;
            })
            //.attr("r", function(d) { var minRadius = 5; return minRadius + Math.pow(d.pop, (1 / 3.5)) })
            .attr("r", function() {
                if (mobile) return '10';
                else return '15';
            })
            .attr("cx", function(d) { return x(d.mean); })
            .attr("cy", function(d) { return y(d.median); })
            .style("fill", function(d) {
                if (!mobile)
                    if (d.median > 46) { return 'tomato'; } else { return '#0570b0'; }
                else if (mobile)
                    if (d.city == 'Flein' | d.city == 'Beilstein') { return 'tomato'; } else { return '#0570b0'; }
            })
            .style("opacity", "0.7");
        gdots.append("text")
            .attr('class', 'annotation')
            .style("text-anchor", "middle")
            .attr("dx", function(d) { return x(d.mean); })
            .attr("dy", function(d) {
                if (d.city != 'Massenbachhausen') {
                    return y(d.median) + 27;
                } else return y(d.median) - 17;
            })
            .text(function(d) {
                if (!mobile)
                    if (d.median == 47)
                        return d.city;
                if (mobile)
                    if (d.city == 'Flein' | d.city == 'Beilstein')
                        return d.city;
            });
        var options = dropDown.selectAll("option")
            .data([{ city: 'Wählen Sie eine Gemeinde' }].concat(data))
            .style("text-anchor", "middle")
            .enter()
            .append("option");
        options.text(function(d) { return d.city; })
            .attr("value", function(d) { return d.city; });
        dropDown.on("change", function() {
            var selected = this.value;
            if (selected == 'All') {
                svg.selectAll(".dot")
                    .style("fill", '#0570b0');
            } else {
                svg.selectAll(".dot")
                    .filter(function(d) { return selected != d.city; })
                    .style("fill", '#0570b0')
                    .classed('selected', false);
                svg.selectAll(".dot")
                    .filter(function(d) { return selected == d.city; })
                    .classed('selected', true)
                    .style("fill", 'tomato');
                svg.selectAll(".annotation")
                    .filter(function(d) { return selected != d.city; })
                    .text(null)
                    .classed('selected', false);
                svg.selectAll(".annotation")
                    .filter(function(d) { return selected == d.city; })
                    .classed('selected', true)
                    .text(function(d) { return d.city; })
                    .attr("dx", function(d) { return x(d.mean); })
                    .attr("dy", function(d) {
                        return y(d.median) + 27;
                    });
                d3.selectAll('circle.dot.selected').raise();
                d3.selectAll('text.annotation.selected').raise();
            }
        });
        // text label for the y axis
        svg.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 14)
            .attr("x", -20)
            .style("text-anchor", "end")
            .style('fill', 'grey')
            .text("Medianalter");
        // text label x axis
        svg.append("text")
            .attr("class", "label")
            .attr("x", scatterWidth)
            .attr("y", scatterHeight - 5)
            .style("text-anchor", "end")
            .style('fill', 'grey')
            .text("Ärzte/1.000 EW");
    });
}

function getHeight() {
    if (mobile) return 300;
    else return 400;
}
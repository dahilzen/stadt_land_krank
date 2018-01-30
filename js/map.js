// Verschiedene globale Variablen für die Funktionen
var projection;
var svg, g;
var chartWidth, chartHeight, path, label;
var land, region, praxen;
// Verschiedene Arrays, um bestimmte Kommunen hervorzuheben
var citys = ['Heidelberg', 'Ulm', 'Heilbronn', 'Freiburg', 'Stuttgart', 'Karlsruhe', 'Mannheim'];
var regionLK = ['Heilbronn', 'Heilbronn - Land', 'Hohenlohekreis'];
var gemeindenArray = ['Bretzfeld', 'Dörzbach', 'Forchtenberg', 'Ingelfingen', 'Krautheim',
    'Künzelsau', 'Kupferzell', 'Mulfingen', 'Neuenstein', 'Niedernhall', 'Öhringen',
    'Pfedelbach', 'Schöntal', 'Waldenburg', 'Weißbach', 'Zweiflingen', 'Heilbronn', 'Abstatt',
    'Bad Friedrichshall', 'Bad Rappenau', 'Bad Wimpfen', 'Beilstein', 'Brackenheim',
    'Cleebronn', 'Eberstadt', 'Ellhofen', 'Eppingen', 'Erlenbach', 'Flein', 'Gemmingen',
    'Gundelsheim', 'Güglingen', 'Hardthausen am Kocher', 'Ilsfeld', 'Ittlingen', 'Jagsthausen',
    'Kirchardt', 'Langenbrettach', 'Lauffen am Neckar', 'Lehrensteinsfeld', 'Leingarten',
    'Löwenstein', 'Massenbachhausen', 'Möckmühl', 'Neckarsulm', 'Neckarwestheim', 'Neudenau',
    'Neuenstadt am Kocher', 'Nordheim', 'Obersulm', 'Oedheim', 'Offenau', 'Pfaffenhofen',
    'Roigheim', 'Schwaigern', 'Siegelsbach', 'Talheim', 'Untereisesheim', 'Untergruppenbach',
    'Weinsberg', 'Widdern', 'Wüstenrot', 'Zaberfeld'
];

function drawMap() {
    // Breite der Grafik an den Container anpassen
    chartWidth = parseFloat(chart.style('width'));
    chartHeight = parseFloat(chart.style('height'));
    //Create an SVG
    svg = chart.append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('class', 'map');
    // Projektion für das komplette Bundesland
    projection = d3.geoMercator()
        .scale(getScale())
        .center([8.996590324431942, 48.67435107509102]) //projection center
        .translate([chartWidth / 2, chartHeight / 2]); //translate to center the map in view
    //Generate paths based on projection
    path = d3.geoPath()
        .projection(projection);
    //Group for the map features and draw them in order
    var regio = svg.append('g');
    var circle = svg.append('g');
    var labels = svg.append('g');
    //Haus- und Facharztpraxen sowie die Umrisse von Land und Gemeinden simultan einlesen und 
    //erst zeichnen, wenn komplett geladen
    d3.queue()
        .defer(d3.json, '../data/alle_gemeinden_wgs84.topojson')
        .defer(d3.csv, '../data/180110_praxen_fa_geo.csv')
        .defer(d3.csv, '../data/180110_praxen_ha_geo.csv')
        .await(function(error, reg, ha, fa) {
            if (error) {
                console.error('Da ist etwas schiefgelaufen: ' + error);
            } else {
                //Alle Hausarzt und Facharztpraxen als Kreise hinzufügen
                praxen = circle.selectAll('circle')
                    .data(ha)
                    .data(fa)
                    .enter()
                    .append('circle')
                    .style('fill', 'tomato')
                    .attr('class', 'praxen')
                    .attr('stroke-width', function() {
                        if (mobile) return '0.5px';
                        else return '1px';
                    })
                    .attr('stroke', 'black')
                    .style('opacity', 0)
                    .style('stroke-opacity', 0.75)
                    .attr('transform', function(d) {
                        return 'translate(' + projection([
                            d.lon,
                            d.lat
                        ]) + ')';
                    });
                //TopoJSON mit allen Gemeinden des Landes einlesen und Attribute und Stales setzen   
                region = regio.selectAll('path')
                    .data(topojson.feature(reg, reg.objects.collection).features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'region')
                    .style('fill', '#023858')
                    .style('fill-opacity', 0.5)
                    .style('stroke', 'white')
                    .style('stroke-opacity', 0.1)
                    .style('opacity', 1);
                label = labels.selectAll('.label')
                    .data(topojson.feature(reg, reg.objects.collection).features)
                    .enter()
                    .append('text')
                    .attr("class", "label")
                    .attr('x',
                        function(d) { return path.centroid(d)[0]; }).attr('y', function(d) {
                        return path.centroid(d)[1];
                    })
                    .style('text-anchor', 'middle')
                    .style('font-size', 10)
                    .style('fill', 'white')
                    .text(function(d) {
                        if (citys.includes(d.properties.Name)) return d.properties.Name;
                    })
                    .style('opacity', 1);
            }
        });
}

var stepArray = [
    function mapDefault() {
        praxen.style('opacity', 0);
        region.style('opacity', 1)
            .style('fill', '#023858')
            .style('fill-opacity', 0.5);
        svg.selectAll('.label')
            .style('opacity', '0');
        label.attr('y', function(d) { return path.centroid(d)[1]; })
            .style('opacity', 1);
    },
    function showDocs() {
        praxen
            .style('opacity', 1).attr("r", function() {
                if (mobile) return '1';
                else return '2'
            });
        label.style('opacity', 0);
    },
    function showCitys() {
        // Projektion für das komplette Bundesland
        projection = d3.geoMercator()
            .scale(getScale())
            .center([8.996590324431942, 48.67435107509102]) //projection center
            .translate([chartWidth / 2, chartHeight / 2]); //translate to center the map in view
        //Generate paths based on projection
        path = d3.geoPath()
            .projection(projection);
        svg.selectAll('path')
            .attr('d', path);
        //Städte hervorheben
        praxen.style('opacity', 1) //.transition().duration(1000)
            .attr('transform', function(d) {
                return 'translate(' + projection([
                    d.lon,
                    d.lat
                ]) + ')';
            }).attr('r', function(d) {
                if (mobile)
                    if (citys.includes(d.landkreis)) return 2;
                    else return 1
                else if (!mobile)
                    if (citys.includes(d.landkreis)) return 3;
                    else return 1;
            });
        label.attr('y', function(d) {
                if (mobile) return (path.centroid(d)[1] + 15);
                else return (path.centroid(d)[1] + 30);
            })
            .style('opacity', 1);
        svg.selectAll('.region')
            .style('stroke', 'white')
            .style('stroke-opacity', 0.1);
    },
    function zoomToRegion() {
        //Label wieder verstecken
        svg.selectAll('.label')
            .style('opacity', '0');
        svg.selectAll('.land')
            .style('opacity', '0');
        projection = d3.geoMercator()
            .scale(chartWidth * 50)
            .center([9.3576270, 49.2149840]) // centers map at given coordinates
            .translate([chartWidth / 2, chartHeight / 2]); // translate map to svg
        //Generate paths based on projection
        path = d3.geoPath()
            .projection(projection);
        praxen
            .style('opacity', 0).attr('transform', function(d) {
                return 'translate(' + projection([
                    d.lon,
                    d.lat
                ]) + ')';
            }) //.transition().delay(2000).duration(1000)
            .style('opacity', function(d) {
                if (regionLK.includes(d.landkreis)) return 1;
                else return 0;
            }).attr("r", function() {
                if (mobile) return '2';
                else return '3'
            });
        svg.selectAll('.region').style('stroke', 'white').style('stroke-opacity', function(d) {
            if (gemeindenArray.includes(d.properties.Name)) return 1;
            else return 0.1;
        });
        svg.selectAll('path') //.transition().delay(1500).duration(500)
            .attr('d', path);
        svg.selectAll('.region').style('stroke', 'white').style('stroke-width', 1);
    },
    function highlightHeilbronn() {
        highlighting('Heilbronn');
    },
    function highlightZweiflingen() {
        highlighting('Zweiflingen');
    }
];
// Skalierung abhängig von Viewport-Breite errechnen
function getScale() {
    var viewportWidth = window.innerWidth;
    var initZoom;
    if (viewportWidth < [800]) {
        initZoom = 5500;
    } else {
        initZoom = 11630;
    }
    return initZoom;
}

function highlighting(name) {
    svg.selectAll('.region').style('stroke', function(d) {
        if (d.properties.Name == name) return 'red';
        else return 'white';
    }).style('stroke-width', function(d) {
        if (d.properties.Name == name) return 5;
        else return 1;
    });
}
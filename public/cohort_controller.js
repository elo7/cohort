
import d3 from 'd3';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
var module = require('ui/modules').get('cohort');

module.controller('cohort_controller', function($scope, $element, Private) {

    const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);
    const round = function(v){ return Math.round(v * 100) / 100; };
    const red = "#ff4e61";
    const yellow = "#ffef7d";
    const green = "#32c77c";

    const formatTypes = {
        undefined : function(d) { return d; },
        custom    : d3.time.format("%Y/%m/%d %H:%M:%S"),
        auto      : d3.time.format("%Y/%m/%d %H:%M:%S"),
        ms        : d3.time.format("%Y/%m/%d %H:%M:%S,%L"),
        s         : d3.time.format("%Y/%m/%d %H:%M:%S"),
        m         : d3.time.format("%Y/%m/%d %H:%M"),
        h         : d3.time.format("%Y/%m/%d %H:%M"),
        d         : d3.time.format("%Y/%m/%d"),
        w         : d3.time.format("%Y/%m/%d"),
        M         : d3.time.format("%Y/%m"),
        y         : d3.time.format("%Y")
    };

    $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
        if (!resp) {
            return;
        }

        var formatTime = formatTypes[getDateHistogram($scope.vis)];
        var data = processData($scope.vis, resp);
        var valueFn = getValueFunction($scope);

        var $div = $element.empty(),
            $closest = $div.closest('div.visualize-chart'),
            margin = { top: 40, right: 80, bottom: 40, left: 50 },
            width = $closest.width() - margin.left - margin.right,
            height = $closest.height() - margin.top - margin.bottom,
            id = $div.attr('id'),
            meassures = {
                width : width,
                height : height,
                margin : margin,
                allWidth : width + margin.right + margin.left,
                allHeight : height + margin.top + margin.bottom,

            };


        if ($scope.vis.params.table) {
            showTable($scope, id, meassures, data, valueFn, formatTime);
        } else {
            showGraph($scope, id, meassures, data, valueFn, formatTime);
        }

    });

    function showTable($scope, id, meassures, data, valueFn, formatTime) {

        var minMaxesForColumn = []
        var periodMeans = d3.nest().key(function(d) { return d.period; }).entries(data).map(function(d){
            var minMax = d3.extent(d.values, valueFn);
            var mean = round(d3.mean(d.values, valueFn));
            var minMaxObj = {
                min: minMax[0],
                max: minMax[1],
                mean: mean
            }
            minMaxesForColumn.push(minMaxObj);
            return mean;
        });
        var meanOfMeans = round(d3.mean(periodMeans, function(meanObj){
            return meanObj;
        }));


        var groupedData = d3.nest().key(function(d) { return formatTime(d.date); }).entries(data);

        var customColumn = "Term";
        if (getDateHistogram($scope.vis)){
            customColumn = "Date";
        }
        var fixedColumns = ["Total", customColumn];
        var columns = d3.map(data, function(d){return d.period; }).keys();
        var allColumns = fixedColumns.concat(columns);
        var rowsData = d3.map(data, function(d){return d.date; }).keys();

        var table = d3.select("#" + id).append('table')
            .attr("width", meassures.width)
            .attr("class", "cohort_table");

        var thead = table.append('thead');
        var tbody = table.append('tbody');
        var tfoot = table.append('tfoot');

        thead.append('tr')
            .selectAll('th')
            .data(allColumns)
            .enter()
            .append('th')
            .text(function (column) { return column; });

        var rows = tbody.selectAll('tr')
            .data(groupedData)
            .enter()
            .append('tr');

        var colorScale = getColorScale($scope, data, valueFn);

        var cells = rows.selectAll('td')
            .data(function(row){
                var date = row.key;
                var total;
                var vals = columns.map(function(period){
                    var val;
                    row.values.map(function(d) {
                        if (period == d.period){
                            total = round(d.total);
                            val = valueFn(d);
                        }
                    });
                    return val;
                });

                return [total, date].concat(vals);
            })
            .enter()
            .append('td')
            .style("background-color", function(d,i) {
                if (i >= 2) { // skip first and second columns
                    return colorScale(d, minMaxesForColumn[i - 2]);
                }
            })
            .text(function (d) { return d; });

        var meanOfMeansTittle = "Mean (" +meanOfMeans+")";
        var allMeans = ["-",  meanOfMeansTittle].concat(periodMeans);

        tfoot.append('tr')
            .selectAll('td')
            .data(allMeans)
            .enter()
            .append('td')
            .text(function (d) { return d; });

    }

    function showGraph($scope, id, meassures, data, valueFn, formatTime) {

        var svg = d3.select("#" + id)
            .append("svg")
            .attr("width", meassures.allWidth)
            .attr("height", meassures.allHeight);

        var g = svg.append("g").attr("transform", "translate(" + meassures.margin.left + "," + meassures.margin.top + ")");

        var x = d3.scale.linear().range([0, meassures.width]),
            y = d3.scale.linear().range([meassures.height, 0]),
            z = d3.scale.category20();

        var line = d3.svg.line()
            // .curve(d3.curveBasis)
            .x(function(d) { return x(d.period); })
            .y(function(d) { return y(valueFn(d)); });

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom").ticks(5);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left").ticks(5);

        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        x.domain(d3.extent(data, function(d) { return d.period; }));
        y.domain([0, d3.max(data, valueFn)]);

        var dataNest = d3.nest()
            .key(function(d) { return formatTime(d.date); })
            .entries(data);

        z.domain(dataNest.map(function(d) { return d.key; }));

        g.selectAll("dot_x")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", function(d) { return x(d.period); })
            .attr("cy", function(d) { return y(valueFn(d)); })
            .style("fill", function(d) { return z(formatTime(d.date)); })
            .style("opacity", 1)
            .on("mouseover", function(d) {
                tooltip.transition()
                   .duration(100)
                   .style("opacity", .9);
                tooltip.html(formatTime(d.date) + " ( " + d.period + " ) <br/>" + round(valueFn(d)) )
                    .style("background", z(formatTime(d.date)))
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 35) + "px");
                })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + meassures.height + ")")
            .call(xAxis);

        g.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)
            .append("text")
            .attr("y", 6)
            .attr("x", 6)
            .attr("dy", ".45em")
            .style("font", "10px sans-serif")
            .style("text-anchor", "start")
            .text($scope.vis.params.percentual ? "Percentual %" : "Total Count");;

        var cohortDate = g.selectAll(".cohortDate")
            .data(dataNest)
            .enter()
            .append("g")
            .attr("class", "cohortDate");

        cohortDate.append("path")
            .attr("class", "cohort_line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return z(d.key); });

        var legend = g.append('g')
            .attr("class", "legend")
            .attr("x", 10)
            .attr("y", 35)
            .attr("height", 100)
            .attr("width", 100);

        legend.selectAll("rect")
            .data(dataNest)
            .enter()
            .append("rect")
            .attr("x", 10)
            .attr("y", function(d, i){ return i *  20 + 20;})
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d) { return z(d.key); });

        legend.selectAll("text")
            .data(dataNest)
            .enter()
            .append("text")
            .attr("x", 30)
            .attr("y", function(d, i){ return i *  20 + 28;})
            .style("font", "10px sans-serif")
            .text(function(d) { return d.key; });
    }

    function getValueFunction($scope) {

        var cumulative = function(d) { return d.cumulativeValue; };
        var absolute = function(d) { return d.value; };
        var value = $scope.vis.params.cumulative ? cumulative : absolute;

        var percent = function(d) { return round( (value(d) / d.total) * 100 ); };
        var inverse = function(d) { return round( 100 - (value(d) / d.total) * 100 ); };
        if($scope.vis.params.percentual) {
            if ($scope.vis.params.inverse) {
                return inverse;
            } else {
                return percent;
            }
        }

        return value;

    }

    function getDateHistogram($vis) {
        var schema = $scope.vis.aggs.filter(function(agg) { return agg.schema.name == "cohort_date"; });
        if (schema[0].type.name == "date_histogram") {
            return schema[0].params.interval.val;
        }
    }

    function getHeatMapColor(data, valueFn){
        var domain = d3.extent(data, valueFn);
        domain.splice(1, 0, d3.mean(domain));
        return d3.scale.linear().domain(domain).range([red, yellow, green]);
    }

    function getMeanColor(d, column){
        return d3.scale.linear().domain([column.min, column.mean, column.max]).range([red, yellow, green])(d);
    }

    function getAboveAverageColor(d, column){
        if(d > column.mean){
            return green;
        } else if(d == column.mean) {
            return yellow;
        } else if (d < column.mean){
            return red;
        }
    }

   function getColorScale($scope, data, valueFn) {
        if ($scope.vis.params.mapColors == "heatmap") {
            return getHeatMapColor(data, valueFn);

        } else if ($scope.vis.params.mapColors == "mean"){
            return getMeanColor;

        } else if ($scope.vis.params.mapColors == "aboveAverage") {
            return getAboveAverageColor;

        } else {
            return function(d) { };
        }
    }

    function processData($vis, resp) {
        var esData = tabifyAggResponse($vis, resp);
        var data = esData.tables[0].rows.map(function(row) {
            var dateHistogram = getDateHistogram($vis);
            return {
                "date": dateHistogram ? new Date(row[0]) : row[0],
                "total": row[1],
                "period": row[2],
                "value": row[3]
            };
         });

        var cumulativeData = {};
        data.forEach(function(d) {
            var lastValue = cumulativeData[d.date] ? cumulativeData[d.date] : 0;
            d.cumulativeValue = lastValue + d.value;
            cumulativeData[d.date] = d.cumulativeValue;
        });

        return data;
    }
});


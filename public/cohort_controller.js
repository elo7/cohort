
import d3 from 'd3';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
var module = require('ui/modules').get('cohort');

module.controller('cohort_controller', function($scope, $element, Private) {

    const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

    $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
        if (!resp) {
            return;
        }

        // todo tooltip / legenda (http://bl.ocks.org/d3noob/a22c42db65eb00d4e369)

        var $div = $element.empty(),
            margin = { top: 40, right: 80, bottom: 40, left: 50 },
            $closest = $div.closest('div.visualize-chart'),
            width = $closest.width() - margin.left - margin.right,
            height = $closest.height() - margin.top - margin.bottom;

        var svg = d3.select("#" + $div.attr('id'))
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var percentCumulative = function(d) { return (d.cumValue / d.total) * 100; };
        var cumulative = function(d) { return d.cumValue; };

        console.log($scope.vis.params);

        var yValue = $scope.vis.params.percentual ? percentCumulative : cumulative;

        var x = d3.scale.linear().range([0, width]),
            y = d3.scale.linear().range([height, 0]),
            z = d3.scale.category20();

        var line = d3.svg.line()
            // .curve(d3.curveBasis)
            .x(function(d) { return x(d.period); })
            .y(function(d) { return y(yValue(d)); });

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom").ticks(5);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left").ticks(5);

        var esData = tabifyAggResponse($scope.vis, resp);

        console.log("esData.tables[0].rows", esData.tables[0].rows);

        var data = esData.tables[0].rows.map(function(row) {
            return {
                "date": new Date(row[0]),
                "total": row[1],
                "period": row[2],
                "value": row[3]
            };
         });

        data.sort(function(a, b){
            if (a.period===b.period) {
               return d3.ascending(a.date, b.date);
            }
            return d3.ascending(a.period, b.period);
        });

        var cumulativeData = {};
        data.forEach(function(d) {
            var lastValue = cumulativeData[d.date] ? cumulativeData[d.date] : 0;
            d.cumValue = lastValue + d.value;
            cumulativeData[d.date] = d.cumValue;
        });

        console.log("Data", data);

        x.domain(d3.extent(data, function(d) { return d.period; }));
        y.domain([0, d3.max(data, yValue)]);

        var formatTime = d3.time.format("%Y-%m-%d");
        var dataNest = d3.nest()
            .key(function(d) { return formatTime(d.date); })
            .entries(data);

        z.domain(dataNest.map(function(d) { return d.key; }));

        console.log("DataNest", dataNest);

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
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
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return z(d.key); });

        cohortDate.append("text")
            .datum(function(d) { return {id: d.key, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.period) + "," + y(yValue(d.value)) + ")"; })
            .attr("x", 3)
            .attr("dy", "0.45em")
            .style("font", "10px sans-serif")
            .text(function(d) { return d.id; });

     });
});

 // Create an Angular module for this plugin

 import d3 from 'd3';
 import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
 var module = require('ui/modules').get('cohort');


 module.controller('cohort_controller', function($scope, $element, Private) {

     const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

     $scope.$watch('esResponse', function(resp) {
         if (!resp) {
             return;
         }

         // todo soma cumulativa (http://bl.ocks.org/jltran/bcd2a30fd9c08f8b9f87)
         // todo percentual
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

         var x = d3.scale.linear().range([0, width]),
             y = d3.scale.linear().range([height, 0]),
             z = d3.scale.category20();

         var line = d3.svg.line()
             // .curve(d3.curveBasis)
             .x(function(d) { return x(d.period); })
             .y(function(d) { return y(d.value); });


         var xAxis = d3.svg.axis()
             .scale(x)
             .orient("bottom").ticks(5);

         var yAxis = d3.svg.axis()
             .scale(y)
             .orient("left").ticks(5);

         var esData = tabifyAggResponse($scope.vis, resp);
         var data = esData.tables[0].rows.map(function(row) {
             return {
                 "period": row[0],
                 "date": new Date(row[1]),
                 "value": row[2],
             };
         });

         console.log("Data", data);

         x.domain(d3.extent(data, function(d) { return d.period; }));
         y.domain([0, d3.max(data, function(d) { return d.value; })]);

         var dataNest = d3.nest()
             .key(function(d) { return d.date; })
             .entries(data);

         z.domain(dataNest.map(function(d) { return d.key; }));

         console.log("DataNest", dataNest);

         g.append("g")
             .attr("class", "axis axis--x")
             .attr("transform", "translate(0," + height + ")")
             .call(xAxis);

         g.append("g")
             .attr("class", "axis axis--y")
             .call(yAxis);

         var cohortDate = g.selectAll(".cohortDate")
             .data(dataNest)
             .enter()
             .append("g")
             .attr("class", "cohortDate");

         cohortDate.append("path")
             .attr("class", "line")
             .attr("d", function(d) { return line(d.values); })
             .style("stroke", function(d) { return z(d.key); });

         // cohortDate.append("text")
         //       .datum(function(d) { return {id: d.key, value: d.values[d.values.length - 1]}; })
         //       .attr("transform", function(d) { return "translate(" + x(d.value.cohort) + "," + y(d.value.value) + ")"; })
         //       .attr("x", 3)
         //       .attr("dy", "0.35em")
         //       .style("font", "10px sans-serif")
         //       .text(function(d) { return d.id; });

     });
 });

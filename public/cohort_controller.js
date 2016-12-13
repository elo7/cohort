 // Create an Angular module for this plugin

import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
var module = require('ui/modules').get('cohort');
const d3 = require('d3');

module.controller('cohort_controller', function($scope, $element, Private) {

    const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

    $scope.$watch('esResponse', function(resp) {
        if (!resp) {
            return;
        }

        var esData = tabifyAggResponse($scope.vis, resp);

        // build x-axis (cohorts)

        // build y-axis (cumulative sum)

        console.log(esData.tables);
        // console.log(JSON.stringify(resp);
        // console.log(JSON.stringify(esData.tables));

        esData.tables.forEach(function(table) {
            var $table = $element.empty().append("<table>").attr("border", 1);
            var $tr = $table.append("<tr>");
            table.columns.forEach(function(col) {
                $tr.append("<th>" + col.title + "</th>")
            });

            table.rows.forEach(function(row) {
                var $tr = $table.append("<tr>");
                row.forEach(function (value, i) {
                    $tr.append("<td>" + value + "</td>")
                });
            });

        });

    });
});

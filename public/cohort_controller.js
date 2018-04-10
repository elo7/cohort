import 'ui/visualize';
import {AggResponseTabifyProvider} from 'ui/agg_response/tabify/tabify';
import {uiModules} from 'ui/modules';
import {getFormatTypes, processData, getValueFunction, showTable, showGraph} from './utils';

const module = uiModules.get('cohort', ['kibana']);
module.controller('cohortController', function ($scope, $element, Private) {
  const tabifyAggResponse = Private(AggResponseTabifyProvider);

  $scope.$watchMulti([
    'esResponse',
    'vis.params.percentual',
    'vis.params.inverse',
    'vis.params.cumulative',
    'vis.params.table',
    'vis.params.mapColors'
  ], ([resp]) => {
    if (!resp) {
      return;
    }

    const esData = tabifyAggResponse($scope.vis, resp);
    const formatTime = getFormatTypes($scope.vis);
    const data = processData(esData, $scope.vis);
    const valueFn = getValueFunction($scope.vis.params);

    const $div = $element.empty();
    const $closest = $div.closest('.visualize-chart');
    const margin = {top: 40, right: 80, bottom: 40, left: 50};
    const width = $closest.width() - margin.left - margin.right;
    const height = $closest.height() - margin.top - margin.bottom;
    const allWidth = width + margin.right + margin.left;
    const allHeight = height + margin.top + margin.bottom;
    const measures = {width, height, margin, allWidth, allHeight};

    if ($scope.vis.params.table) {
      showTable($scope.vis, $scope.vis.params.mapColors, $element[0], measures, data, valueFn, formatTime);
    } else {
      showGraph($scope.vis.params.percentual, $element[0], measures, data, valueFn, formatTime);
    }
  });
});

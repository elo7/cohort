import './cohort.css'
import './cohort_controller';

import optionsTemplate from './cohort_params.html';
import template from './cohort.html';

import {CATEGORY} from 'ui/vis/vis_category';
import {VisFactoryProvider} from 'ui/vis/vis_factory';
import {VisSchemasProvider} from 'ui/vis/editors/default/schemas';
import {VisTypesRegistryProvider} from 'ui/registry/vis_types';

VisTypesRegistryProvider.register(function CohortProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createAngularVisualization({
    name: 'cohort',
    title: 'Cohort Analysis',
    icon: 'fa-user',
    description: 'Cohort analysis plugin',
    category: CATEGORY.OTHER,
    visConfig: {
      defaults: {
        mapColors: ''
      },
      template: template,
    },
    hierarchicalData: true,
    responseHandler: 'none',
    editorConfig: {
      optionsTemplate: optionsTemplate,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Total',
          max: 1,
          min: 1,
          aggFilter: ['count', 'sum', 'avg'],
          defaults: [
            {type: 'count', schema: 'metric'}
          ]
        }, {
          group: 'buckets',
          name: 'cohort_date',
          title: 'Cohort Date',
          min: 1,
          max: 1,
          aggFilter: ['date_histogram', 'terms']
        }, {
          group: 'buckets',
          name: 'cohort_period',
          title: 'Cohort Period',
          min: 1,
          max: 1,
          aggFilter: 'histogram'
        }
      ])
    }
  });
});


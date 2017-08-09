// Include the angular controller

import cohort_params_template from 'plugins/cohort/cohort_params.html';
import cohort_template from 'plugins/cohort/cohort.html';
import { VisSchemasProvider } from 'ui/vis/schemas';
import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

import 'plugins/cohort/cohort_controller';
import 'plugins/cohort/cohort.css'

VisTypesRegistryProvider.register(function CohortProvider(Private) {

    // Describe our visualization
    const TemplateVisType = Private(TemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);

    return new TemplateVisType({
        name: 'cohort',
        title: 'Cohort Analysis',
        description: 'Cohort analysis plugin',
        icon: 'fa-user', // The font awesome icon of this visualization
        template: cohort_template,
        params: {
            defaults: {
                percentual: false
            },
            editor: cohort_params_template
        },
        hierarchicalData: function (vis) {
            return Boolean(true);
        },
        schemas:
            new Schemas([
            {
                group: 'metrics',
                name: 'metric',
                title: 'Total',
                max: 1,
                min: 1,
                aggFilter: ['count', 'sum'],
                defaults: [{
                    type: 'count',
                    schema: 'metric'
                }]
            },
            {
                group: 'buckets',
                name: 'cohort_date',
                title: 'Cohort Date',
                min: 1,
                max: 1,
                aggFilter: ['date_histogram', 'terms']
            },
            {
                group: 'buckets',
                name: 'cohort_period',
                title: 'Cohort Period',
                min: 1,
                max: 1,
                aggFilter: 'histogram'
            }
        ])
    });
});


// Include the angular controller

import 'plugins/cohort/cohort.css'
import cohort_controller from 'plugins/cohort/cohort_controller';
import cohort_params_template from 'plugins/cohort/cohort_params.html';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';

// The provider function, which must return our new visualization type

function CohortProvider(Private) {

    // Describe our visualization
    const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);

    return new TemplateVisType({
        name: 'cohort',
        title: 'Cohort Analysis',
        description: 'Cohort analysis plugin',
        icon: 'fa-user', // The font awesome icon of this visualization
        template: require('plugins/cohort/cohort.html'),
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
}

require('ui/registry/vis_types').register(CohortProvider);

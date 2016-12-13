// Include the angular controller

import 'plugins/cohort/cohort.css'
import cohort_controller from 'plugins/cohort/cohort_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';

// The provider function, which must return our new visualization type

function CohortProvider(Private) {

    // Describe our visualization
    const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);

    return new TemplateVisType({
        name: 'cohort', // The internal id of the vis (must be unique)
        title: 'Cohort Analysis', // The title of the vis, shown to the user
        description: 'Cohort analysis plugin built with love at Elo7', // The description of this vis
        icon: 'fa-user', // The font awesome icon of this visualization
        // The template, that will be rendered for this visualization
        template: require('plugins/cohort/cohort.html'),
        // Define the aggregation your visualization accepts
        schemas: new Schemas([{
            group: 'metrics',
            name: 'metric',
            title: 'Total',
            min: 1,
            aggFilter: ['count'],
            defaults: [{
                type: 'count',
                schema: 'metric'
            }]
        }, {
            group: 'buckets',
            name: 'cohort_period',
            title: 'Cohort Period',
            min: 1,
            max: 1,
            aggFilter: 'histogram'
        }, {
            group: 'buckets',
            name: 'cohort_date',
            title: 'Cohort Date',
            max: 1,
            aggFilter: 'date_histogram'
        }])
    });
}

require('ui/registry/vis_types').register(CohortProvider);

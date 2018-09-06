export default kibana => new kibana.Plugin({
  id: 'cohort',
  require: ['elasticsearch'],

  uiExports: {
    visTypes: ['plugins/cohort/cohort_type'],
  },

  config: (Joi) => Joi.object({
    enabled: Joi.boolean().default(true),
  }).default(),
});

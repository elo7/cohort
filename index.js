export default kibana => {
  return new kibana.Plugin({
    id: 'cohort',
    require: ['elasticsearch'],

    uiExports: {
      visTypes: [
        'plugins/cohort/cohort'
      ]
    },

    config: (Joi) => Joi.object({
      enabled: Joi.boolean().default(true)
    }).default(),
  });
}

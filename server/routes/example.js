export default function (server) {

  server.route({
    path: '/api/cohort_analysis/example',
    method: 'GET',
    handler(req, reply) {
      reply({ time: (new Date()).toISOString() });
    }
  });

};

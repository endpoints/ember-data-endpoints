import EndpointsSerializer from 'ember-data-endpoints/serializer';
import EndpointsAdapter from 'ember-data-endpoints/adapter';

export function initialize(container, application) {
  // application.inject('route', 'foo', 'service:foo');
  container.register('serializer:endpoints', EndpointsSerializer);
  container.register('adapter:endpoints', EndpointsAdapter);
}

export default {
  name: 'endpoints',
  initialize: initialize
};

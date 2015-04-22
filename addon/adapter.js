import Ember from 'ember';
import JSONAPIAdapter from './json-api-adapter';

export default JSONAPIAdapter.extend({
  defaultSerializer: 'endpoints'
});

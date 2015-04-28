import Ember from 'ember';
import JSONAPISerializer from './json-api-serializer';

var underscore = Ember.String.underscore;

export default JSONAPISerializer.extend({
  keyForAttribute: function(attr) {
    return underscore(attr);
  },

  keyForRelationship: function(rawKey) {
    return underscore(rawKey);
  }
});

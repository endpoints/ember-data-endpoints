import Ember from 'ember';
import DS from 'ember-data';

export default DS.ActiveModelAdapter.extend({
  defaultSerializer: 'endpoints',

  // Workaround where REST URLs were getting camelCased
  // https://github.com/ember-cli/ember-cli/issues/2906
  pathForType: function(type) {
    var dasherized = Ember.String.dasherize(type);
    return Ember.String.pluralize(dasherized);
  }
});

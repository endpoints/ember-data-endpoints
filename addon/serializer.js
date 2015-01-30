import DS from "ember-data";
import Ember from 'ember';

var underscore = Ember.String.underscore;

export default DS.RESTSerializer.extend({

  normalize: function(type, hash, prop) {
    var links = hash.links;
    for (var key in links) {
      var linkedData = links[key];
      if (linkedData.href) {
        hash[key] = linkedData.href;
      } else if (linkedData.ids) {
        hash[key] = linkedData.ids;
      } else {
        hash[key + '_id'] = linkedData.id;
      }
    }
    delete hash.links;
    return this._super(type, hash, prop);
  },

  normalizePayload: function(payload) {
    if (payload.linked) {
      var store = Ember.get(this, 'store');
      this.pushPayload(store, payload.linked);
      delete payload.linked;
    }
    return this._super(payload);
  },

  keyForRelationship: function(key, relationship) {
    if (relationship === 'belongsTo') {
      return underscore(key) + '_id';
    }
    return key;
  }
});

import DS from "ember-data";
import Ember from 'ember';

var singularize = Ember.String.singularize;
var camelize = Ember.String.camelize;

export default DS.RESTSerializer.extend({

  normalize: function(type, hash, prop) {
    var newLinks = {};
    var links = hash.links;
    for (var key in links) {
      var linkedData = links[key];
      if (linkedData.href) {
        newLinks[key] = linkedData.href;
      } else if (linkedData.ids) {
        hash[key] = linkedData.ids;
      } else {
        hash[key + '_id'] = linkedData.id;
      }
    }
    delete hash.links;
    hash.links = newLinks;

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
      return key + '_id';
    }
    return key;
  }
});

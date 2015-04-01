import Ember from 'ember';
import DS from 'ember-data';

var dasherize = Ember.String.dasherize;
var pluralize = Ember.String.pluralize;

export default DS.ActiveModelSerializer.extend({

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

  serializeIntoHash: function(data, type, record, options) {
    var root = dasherize(pluralize(type.typeKey));
    data[root] = this.serialize(record, options);
  }
});

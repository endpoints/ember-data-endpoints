/**
   @module ember-data
 */
import Ember from 'ember';
import DS from 'ember-data';
var Serializer = DS.Serializer;

var copy = Ember.copy;
var get = Ember.get;
var forEach = Ember.ArrayPolyfills.forEach;
var map = Ember.ArrayPolyfills.map;

/**
   @class JSONAPISerializer
   @namespace DS
   @extends DS.Serializer
 */
export default Serializer.extend({

  keyForAttribute: function(key) {
    return Ember.String.dasherize(key);
  },

  keyForRelationship: function(key, kind) {
    return Ember.String.dasherize(key);
  },

  normalizeTypeKey: function(typeKey) {
    return Ember.String.singularize(Ember.String.camelize(typeKey));
  },

  serializeTypeKey: function(typeKey) {
    return Ember.String.dasherize(typeKey);
  },



  extract: function(store, type, payload, id, requestType) {
    if (!payload.data) { return; }

    var dataType = Ember.typeOf(payload.data);

    switch (dataType) {
    case 'object':
      return this.extractSingle(store, payload, id);
    case 'array':
      store.setMetadataFor(type, payload.meta || {});
      return this.extractArray(store, payload);
    }
  },

  extractSingle: function(store, payload, id) {
    var data;

    this.extractIncluded(store, payload.included);

    data = this.extractData(store, get(payload, 'data'));

    return data;
  },

  extractArray: function(store, payload) {
    var data;

    this.extractIncluded(store, payload.included);

    data = map.call(payload.data, function(item) {
      return this.extractData(store, item);
    }, this);

    return data;
  },

  extractData: function(store, data) {
    var type, typeName, typeSerializer;

    if (!data) { return; }

    typeName = this.normalizeTypeKey(data.type);

    Ember.assert('No model was found for model name "' + typeName + '"', store.modelFactoryFor(typeName));

    type = store.modelFor(typeName);
    typeSerializer = store.serializerFor(type);

    return typeSerializer.normalize(type, data);
  },

  extractIncluded: function(store, included) {
    var type, typeName, typeSerializer, hash;

    if (!included) { return; }

    forEach.call(included, function(data) {
      typeName = this.normalizeTypeKey(data.type);

      if (!store.modelFactoryFor(typeName)) {
        Ember.warn('No model was found for model name "' + typeName + '"', false);
        return;
      }

      type = store.modelFor(typeName);
      typeSerializer = store.serializerFor(type);

      hash = typeSerializer.normalize(type, data);
      store.push(typeName, hash);
    }, this);
  },



  serialize: function(snapshot, options) {
    var json = {};

    json['type'] = this.serializeTypeKey(snapshot.typeKey);

    if (options && options.includeId) {
      json['id'] = snapshot.id;
    }

    snapshot.eachAttribute(function(key, attribute) {
      this.serializeAttribute(snapshot, json, key, attribute);
    }, this);

    snapshot.eachRelationship(function(key, relationship) {
      switch (relationship.kind) {
      case 'belongsTo':
        this.serializeBelongsTo(snapshot, json, relationship);
        break;
      case 'hasMany':
        this.serializeHasMany(snapshot, json, relationship);
        break;
      }
    }, this);

    json = { data: json };

    return json;
  },

  serializeAttribute: function(snapshot, json, key, attribute) {
    var value = snapshot.attr(key);
    var type = attribute.type;

    if (type) {
      var transform = this.transformFor(type);
      value = transform.serialize(value);
    }

    var payloadKey = this.keyForAttribute(key);
    json[payloadKey] = value;
  },

  serializeBelongsTo: function(snapshot, json, relationship) {
    var key = relationship.key;
    var belongsTo = snapshot.belongsTo(key);

    var links = json['links'] = json['links'] || {};

    var payloadKey = this.keyForRelationship(key, 'belongsTo');
    var linkage = null;

    if (!Ember.isNone(belongsTo)) {
      linkage = {
        type: this.serializeTypeKey(belongsTo.typeKey),
        id: belongsTo.id
      };
    }

    links[payloadKey] = { linkage: linkage };
  },

  serializeHasMany: function(snapshot, json, relationship) {
    var key = relationship.key;
    var hasMany = snapshot.hasMany(key);

    var links = json['links'] = json['links'] || {};

    var payloadKey = this.keyForRelationship(key, 'hasMany');
    var linkage = [];

    for (var i = 0; i < hasMany.length; i++) {
      linkage.push({
        type: this.serializeTypeKey(hasMany[i].typeKey),
        id: hasMany[i].id
      });
    }

    links[payloadKey] = { linkage: linkage };
  },



  normalize: function(type, data) {
    var hash = copy(data);

    this.normalizeAttributes(type, hash);
    this.normalizeRelationships(type, hash);
    this.applyTransforms(type, hash);

    return hash;
  },

  normalizeAttributes: function(type, hash) {
    var payloadKey;

    type.eachAttribute(function(key) {
      payloadKey = this.keyForAttribute(key);

      if (key === payloadKey) { return; }
      if (!hash.hasOwnProperty(payloadKey)) { return; }

      hash[key] = hash[payloadKey];
      delete hash[payloadKey];
    }, this);
  },

  normalizeRelationships: function(type, hash) {
    var payloadKey, link;

    if (!hash.links) { return; }

    type.eachRelationship(function(key, relationship) {
      payloadKey = this.keyForRelationship(key, relationship.kind);

      if (hash.links[payloadKey]) {
        link = hash.links[payloadKey];
        delete hash.links[payloadKey];

        if (link.linkage) {
          switch (relationship.kind) {
          case 'belongsTo':
            this.normalizeBelongsTo(hash, key, link);
            break;
          case 'hasMany':
            this.normalizeHasMany(hash, key, link);
            break;
          }
        } else {
          this.normalizeLink(hash, key, link);
        }
      }
    }, this);
  },

  normalizeBelongsTo: function(hash, key, link) {
    var linkage = link.linkage;
    if (linkage) {
      hash[key] = {
        type: this.normalizeTypeKey(linkage.type),
        id: linkage.id
      };
    }
  },

  normalizeHasMany: function(hash, key, link) {
    var linkage = link.linkage;
    if (linkage) {
      hash[key] = map.call(linkage, function(item) {
        return {
          type: this.normalizeTypeKey(item.type),
          id: item.id
        };
      }, this);
    }
  },

  normalizeLink: function(hash, key, link) {
    if (Ember.typeOf(link) === 'string') {
      hash.links[key] = {
        self: null,
        related: link
      };
    } else {
      hash.links[key] = {
        self: link.self || null,
        related: link.related || null
      };
    }
  },

  applyTransforms: function(type, hash) {
    type.eachTransformedAttribute(function applyTransform(key, type) {
      if (!hash.hasOwnProperty(key)) { return; }

      var transform = this.transformFor(type);
      hash[key] = transform.deserialize(hash[key]);
    }, this);
  }
});

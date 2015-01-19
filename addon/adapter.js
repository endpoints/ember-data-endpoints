import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  defaultSerializer: 'endpoints',
  buildURL: function(type, id, record) {
    var url = this._super(type, id, record);
    var includes = [];
    var model = this.container.lookupFactory('model:' + type);
    model.eachRelationship(function(name, descriptor) {
      if (!descriptor.options.async) {
        includes.push(name);
      }
    });

    if (includes.length) {
      return url + '?include=' + includes.join(',');
    }

    return url;
  }
});

# Ember-data-endpoints

An ember-data adapter for [endpoints](https://github.com/endpoints/endpoints) APIs.

## Usage

Install `ember-data-endpoints`:

 * `npm install --save-dev ember-data-endpoints`
 * Extend your application adapter from the endpoints adapter, e.g.:

```javascript
// app/adapters/application.js

import EndpointsAdapter from "ember-data-endpoints/adapter";
import config from '../config/environment';
export default EndpointsAdapter.extend({
  host: 'http://api.loc',
  headers: {
    'Authorization': 'Bearer ' + config.APP.access_token
  }
});
```

 * Optionally, extend your application serializer from the Endpoints serializer. By default the Endpoints Adapter will automatically load the `EndpointsSerializer` unless you provide an `ApplicationSerializer` or model specific Serializer: 

```javascript
// app/serializers/application.js

import EndpointsSerializer from "ember-data-endpoints/serializer";
export default EndpointsSerializer.extend({
  //...
});
```


### Sideloading

Endpoints will sideload relationships using in a [jsonapi](http://jsonapi.org) compliant manner if you have `include=relationshipName` as a query parameter in your url. The EndpointsAdapter will automatically add this query parameter to request URLs for all non asycn relationships.


## Running Tests

* `ember test`
* `ember test --server`

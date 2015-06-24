import { moduleFor, test } from 'ember-qunit';

moduleFor('serializer:serializer', 'Unit | Serializer | serializer', {
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var serializer = this.subject();

  assert.ok(serializer);
});

test('it underscores attributes', function(assert) {
  var serializer = this.subject();

  equal(serializer.keyForAttribute('fullName'), 'full_name');
});


test('it underscores relationships', function(assert) {
  var serializer = this.subject();

  equal(serializer.keyForRelationship('publishedAuthors'), 'published_authors');
});

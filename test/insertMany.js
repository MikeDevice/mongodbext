'use strict';

var expect = require('expect.js'),
	Steppy = require('twostep').Steppy,
	helpers = require('./helpers');

describe('Test insert many', function() {

	before(helpers.dbConnect);

	describe('returnDocsOnly option', function() {
		var collection;

		before(function() {
			collection = helpers.getCollection();
		});

		it('should be set true by default', function(done) {
			var entities = [helpers.getEntity(), helpers.getEntity()];
			Steppy(
				function() {
					collection.insertMany(entities, this.slot());
				},
				function(err, result) {
					expect(result).ok();
					expect(result).an('array');
					expect(result).eql(entities);
					this.pass(null);
				},
				done
			);
		});

		it('should correctly process true value', function(done) {
			var entities = [helpers.getEntity(), helpers.getEntity()];
			Steppy(
				function() {
					collection.insertMany(entities, this.slot());
				},
				function(err, result) {
					expect(result).ok();
					expect(result).an('object');
					expect(result).eql(entities);
					this.pass(null);
				},
				done
			);
		});

		it('shoud correctly process false value', function(done) {
			var entities = [helpers.getEntity(), helpers.getEntity()];
			Steppy(
				function() {
					collection.insertMany(entities, {
						returnDocsOnly: false
					}, this.slot());
				},
				function(err, result) {
					expect(result).ok();
					expect(result).an('object');
					expect(result).only.keys(
						'result', 'ops', 'insertedCount', 'insertedIds'
					);
					expect(result.ops).eql(entities);
					expect(result.result).eql({ok: 1, n: 2});
					expect(result.insertedCount).equal(2);
					this.pass(null);
				},
				done
			);
		});

		after(helpers.cleanDb);
	});

	describe('hooks', function() {

		it('without hooks, should be ok', function(done) {
			var collection = helpers.getCollection(),
				entities = [helpers.getEntity(), helpers.getEntity()];
			Steppy(
				function() {
					collection.insertMany(entities, this.slot());
				},
				function() {
					collection.find().toArray(this.slot());
				},
				function(err, result) {
					expect(result).ok();
					expect(result).eql(entities);

					helpers.cleanDb(this.slot());
				},
				done
			);
		});

		it('with before hook, should be ok', function(done) {
			var collection = helpers.getCollection({
					beforeInsertMany: function(params, callback) {
						params.objs.forEach(function(obj) {
							obj.c = 100;
						});
						callback();
					}
				}),
				entities = [helpers.getEntity(), helpers.getEntity()];
			Steppy(
				function() {
					collection.insertMany(entities, this.slot());
				},
				function() {
					collection.find().toArray(this.slot());
				},
				function(err, result) {
					entities.forEach(function(entity) {
						entity.c = 100;
					});

					expect(result).ok();
					expect(result).eql(entities);

					helpers.cleanDb(this.slot());
				},
				done
			);
		});

		it('with after hook, should be ok', function(done) {
			var collection = helpers.getCollection({
					afterInsertMany: function(params, callback) {
						params.objs.forEach(function(obj) {
							delete obj._id;
						});
						callback();
					}
				}),
				entities = [helpers.getEntity(), helpers.getEntity()];
			Steppy(
				function() {
					collection.insertMany(entities, this.slot());
				},
				function(err, result) {
					entities.forEach(function(entity) {
						delete entity._id;
					});

					expect(result).ok();
					expect(result).eql(entities);

					helpers.cleanDb(this.slot());
				},
				done
			);
		});

		after(helpers.cleanDb);
	});
});

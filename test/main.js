var should = require('should');
var monGraph = require('../lib/main');

describe('monGraph', function() {
    describe('with no arguments', function() {
        it('returns an empty array', function() {
            var result = monGraph();
            result.should.eql([]);
        });
    });
});
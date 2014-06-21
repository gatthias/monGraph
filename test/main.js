//var should = require('should');
var monGraph = require('../lib/main');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var q = require('q');

chai.should();

chai.use(chaiAsPromised);

describe('monGraph', function() {
    var graph = new monGraph();
    
//    beforeEach(function(done){
//        mongoose.connection.db.dropCollection('nodes', done);
//    });
    
    describe('#CreateNode()', function() {
        describe('with empty object', function(){
            it('should return an empty node written in DB', function(done) {
                graph.createNode(null).should.eventually.have.property("_id").and.notify(done);
            });
        });
        describe('with simple object', function(){
            it('should return a new db node with the object\'s properties', function(done){
                var nodeA = graph.createNode({ name: "nodeA" });
                var nodeB = graph.createNode({ name: "nodeB" });
                q.all([
                    nodeA.should.eventually.have.property("_id"),
                    nodeA.should.eventually.have.property("properties")
                        .that.have.property("name", "nodeA"),
                    nodeB.should.eventually.have.property("_id"),
                    nodeB.should.eventually.have.property("properties")
                    .that.have.property("name", "nodeB")
                ]).should.notify(done);
            });
        });
        
    });
    describe('#getNodes()', function(){
        describe('with simple object', function(){
            it('should get node with property name set to "nameA"', function(done){
                graph.getNodes({name: "nodeA"})
                    .should.eventually.have.deep.property('properties.name', "nodeA").and.notify(done);
            });
        });
        describe('with array of objects', function(){
            it('should get nodes with property names set to "nameA" & "nameB"', function(){//done){
                graph.getNodes([{name: "nodeA"}, {name: "nodeB"}]).then(function(nodes){
                    nodeA = nodes[0]; 
                    nodeB = nodes[1];
                    nodeA.should.have.deep.property('[0].properties.name', "nodeA");//,
                    nodeB.should.have.deep.property('[0].properties.name', "nodeB");
                });
                
            });
        });
    });
    describe('#Node', function(){
        var nodeA, nodeB;
    
//        beforeEach(function(){
//           graph.getNodes([{ name: "nodeA"}, { name: "nodeB" }]).then(function(nodes){
//               nodeA = nodes[0];
//               nodeB = nodes[1];
//           });
//        });
        before(function(done){
            graph.getNodes([{name: "nodeA"}, {name: "nodeB"}]).then(function(nodes){
                nodeA = nodes[0];
                nodeB = nodes[1];
//                console.log(nodeA);
                done();
            });
        });
        
        describe('#setProperty()', function(){
           it('should return node with updated property', function(done){
                nodeA.setProperty('foo', 'bar')
                    .should.eventually.have.deep.property('properties.foo', 'bar').and.notify(done);
           });
        });
//        describe('#createRelationshipTo()', function(){
//            it('should return new relationship between given nodes', function(done){
//                var node = new Node({timestamp:Date.now(), properties: {name: 'nodeC'}, labels: []});
//            
//                node.createRelationshipTo(nodeA, 'Related')
//                    .should.eventually.have.property('_id').and.notify(done);
//            });
//        });
        describe('#link()', function(){
            it('should create given relationship between the given two nodes', function(done){
                nodeA.link(nodeB, 'Related', 0)
                    .should.eventually.have.property('_id').and.notify(done);
            });
        });
        
        describe('#getRelationShips()', function(){
            describe('whith no arguments', function(){
                it('should return all relationships attached to this node', function(done){
                    nodeA.getRelationships()
                        .should.eventually.have.deep.property('[0]._id').and.notify(done);
                });
            });
            describe('whith type argument', function(){
                it('should return all relationships of given type attached to this node', function(done){
                    nodeA.getRelationships('Related')
                    .should.eventually.have.deep.property('[0]._id').and.notify(done);
                });
            });
            describe('whith multiple types argument', function(){
                it('should return all relationships of given type attached to this node', function(done){
                    nodeA.getRelationships(['Related', 'Other'])
                    .should.eventually.have.deep.property('[0]._id').and.notify(done);
                });
            });
            describe('whith type and direction', function(){
                it('should return all relationships of given type and direction attached to this node', function(done){
                    nodeA.getRelationships('Related', 0)
                    .should.eventually.have.deep.property('[0]._id').and.notify(done);
                });
            });
        });
    });
//    describe('with an empty array argument', function() {
//        it('calls the callback with an empty array', function(done) {
//            var result = monGraph([], function(result) {
//                result.should.eql([]);
//                done();
//            });
//        });
//    });
});
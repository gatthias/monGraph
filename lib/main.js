/*
    monGraph
    
    NodeJS module to expose GraphDB services through mongoDB
*/
require('../db.js');
var mongoose = require('mongoose'),
    Node = mongoose.model('Node'),
    Relation = mongoose.model('Relation'),
    q = require('q'),
    ObjectId = mongoose.Types.ObjectId;
var graph = new monGraph();

function monGraph() {
    this.db = mongoose.connection.db;
    this.Node = Node;
    this.Relation = Relation;
    
    return this;
}
//monGraph.prototype.clear = function(){
//    Node.clear(
//}
monGraph.prototype.createNode = function(node){
    var deferred = q.defer();

    if(!node)
        node = {};
    
    new Node({
        timestamp: Date.now(),
        properties: node,
        labels: ['']
    }).save(function(err, newNode){
        // Attach graphDB methods
        
        revivedNode = bindMethods(newNode);
        deferred.resolve(revivedNode);
    });
    
    return deferred.promise;
}
function bindMethods(nodes){
    if(!(nodes instanceof Array))
        nodes = [nodes];
    
    revivedNodes = nodes.map(function(node){
        if(node instanceof Array){
            return bindMethods(node);
        }else{
            node.link = link;
            node.setProperty = setProperty;
            node.getRelationships = getRelationships;
            
            return node;
        }
    });
//    console.log(revivedNodes);
    if(revivedNodes.length == 1)
        return revivedNodes[0];
    else
        return revivedNodes;
}
monGraph.prototype.getNodes = function(query){
    var deferred = q.defer();
//    console.log('query:');console.log(query);
    if(query instanceof Object && !(query instanceof String) && !(query instanceof Array) && !(query instanceof ObjectId)){
        var keys = Object.keys(query);
        var formattedQuery = {};
        if(keys.indexOf('_id') > -1)
            formattedQuery = { _id: query[keys.indexOf('_id')] };
        else{
            for(var i = 0; i < keys.length; i++){
                if(keys[i] == '_id')
                    formattedQuery._id = query[keys[i]];
                else
                    formattedQuery['properties.'+keys[i]] = query[keys[i]];
            }
        }
//        console.log(formattedQuery);
        Node.find(formattedQuery, function(err, foundNodes){
            
            revivedNodes = bindMethods(foundNodes);
//            console.log(revivedNodes);
            deferred.resolve(revivedNodes);
        });
    }else if(query instanceof Array){
        var qArr = query.map(function(partQuery){
            return graph.getNodes(partQuery);
        });
        q.all(qArr).then(function(nodes){
            
//            console.log('multiple nodes found');console.log(nodes);
            deferred.resolve(nodes);
        });
    }else if(query instanceof ObjectId){           //    HS !

        Node.findOne({_id: query}, function(err, node){
            deferred.resolve(bindMethods(node));
        });
    }
    
    return deferred.promise;
}
function setProperty(key, value){
    var deferred = q.defer();
    var updated = JSON.parse(JSON.stringify(this));
    updated.properties[key] = value;
    var id = updated._id;
    delete updated._id;
    Node.findOneAndUpdate({_id: ObjectId(id)}, updated, function(err, node){
        if(err) throw err;
//        console.log(node);
        deferred.resolve(node);
    });
    
    return deferred.promise;
}
function link(nodeB, relType, relDir){
    var deferred = q.defer();
//    console.log(nodeB);
//    q.all([
//        Node.findOne({_id: this._id}),//.exec(),
//        Node.findOne({_id: ObjectId(nodeB._id)})//.exec()
//    ]).then(function(nodes){
////        Nodes.exec(function(err, nodes){   
//    
//        console.log(nodes);
//
//            nodes[0].createRelationshipTo(nodes[1], relType, function(err, rel){
//                console.log('rel');console.log(rel);
//            
//                deferred.resolve(rel);
//            });
//    });
    new Relation({
        timestamp: Date.now(),
        subject: this._id,
        predicate: relType,
        object: nodeB._id,
        direction: relDir,
        properties: {}
    }).save(function(err, rel){
        console.log(rel);
        deferred.resolve(rel);
    });
    
    return deferred.promise;
}
function getRelationships(types, dir){
    var deferred = q.defer();
    var query = {};

    if(!types && !dir){         // no args
        query = [{ object: ObjectId(this._id) },
                 { subject: ObjectId(this._id) } ];
    }else if(!!types && !dir){   // only types
        if(types instanceof Array)
            types = { $in: types };
        query = [{ object: ObjectId(this._id), predicate: types },
                 { subject: ObjectId(this._id) , predicate: types } ];
    }else{                      // both
        if(types instanceof Array)
            types = { $in: types };
        switch(dir){
            case -1:
                query = { predicate: types, direction: -1, subject: ObjectId(this._id)};
                break;
            case 0:
                query = [   { predicate: types, direction: 0, object: ObjectId(this._id)},
                            { predicate: types, direction: 0, subject: ObjectId(this._id)} ];
                break;
            case 1:
                query = { predicate: types, direction: 1, object: ObjectId(this._id)};
                break;
        }
            
    }
    Relation.find(query, function(err, relations){
        deferred.resolve(relations);
    });
    
    return deferred.promise;
}
module.exports = monGraph;

/*

    Node brice = monGraph.createNode();
    brice.setProperty("name", "Brice");
    // Creation des Relations
    martin.createRelationshipTo(romain, RelTypes.FRIEND);
    
    */
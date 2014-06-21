var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    q = require('q');

var Node = new Schema({
    timestamp: Date,
    properties: Object,
    labels: [ String ]
});
var Relation = new Schema({
    timestamp: Date,
    subject: { type: ObjectId, ref: 'Node' },
    predicate: String,//{ type: ObjectId, ref: 'Node' },
    object: { type: ObjectId, ref: 'Node' },
    direction: Number, // -1, 0, 1 (FROM, BOTH, TO)
    properties: Object
});

Node.methods.createRelationshipTo = function(nodeB, relType){
    var deferred = q.defer();
    console.log('createRel!!');
    new Relation({
        timestamp: Date.now(),
        subject: this.id,
        predicate: relType,
        object: nodeB.id,
        direction: 1,
        properties: {}
    }).save(function(err, rel){
        console.log(rel);
        deferred.resolve(rel);
    });
    
    return deferred.promise;
}

mongoose.model( 'Node', Node);
mongoose.model( 'Relation', Relation);

mongoose.connect('mongodb://localhost/monGraph');
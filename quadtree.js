(function(window){

function QuadTree(width, height){
    var rootNode = new QuadTreeNode();
    rootNode.setParams(0, width, 0, height, null, 0);
    return{
        insert: rootNode.insert,
        detect: function(){
            rootNode.migrateBodies();
            rootNode.checkCollisions();
        },
        approachCallback: function(fnc){QuadTree.approachCallback=fnc;},
        describe: rootNode.describe
    };
}

QuadTree.SPLIT_LIMIT = 4;
QuadTree.UNSPLIT_LIMIT = 2;
QuadTree.MAX_LEVELS = 10;
QuadTree.nodeCache = [];
QuadTree.approachCallback = function(body1, body2){};
window.QuadTree = QuadTree;

function QuadTreeNode(){

//static List<CollidableBody> orphanObjects= new List<CollidableBody>();


var top, bottom, left, right;
var midX, midY;
var bodyCount, level;
var pNode = null;

var bodies = [];
var nodes;

function setParams(t, b, l, r, p, lev){
    top = t;
    bottom = b;
    left = l;
    right = r;
    pNode = p;
    level = lev;
    bodies = [];
    bodyCount = 0;
}

function checkCollisions(higherBodies){
  var body1, body2;
  var i;

  if(!higherBodies) higherBodies = [];

  for(i=0;i<bodies.length;i++){
    body1 = bodies[i];

    for(var j=i+1;j<bodies.length;j++){
      body2 = bodies[j];
        QuadTree.approachCallback(body1, body2);
    }
    //notify pairs: node1 and all higher objects
    for(var k=0;k<higherBodies.length;k++)
        QuadTree.approachCallback(body1, higherBodies[k]);
  }

  if(nodes){
    for(i=0;i<nodes.length;i++)
      nodes[i].checkCollisions(higherBodies.concat(bodies));
  }
}

function split(){
    midX = (right + left) / 2;
    midY = (bottom + top) / 2;
    var i;

    //check if there's a premade list of 4 nodes ready
    if(QuadTree.nodeCache.length == 0){
        //if not, create some new nodes
        nodes = [];
        for(i=0;i<4;i++)
          nodes.push(new QuadTreeNode());
    }else
        nodes = QuadTree.nodeCache.pop();

    nodes[0].setParams(top, midY, left, midX, this, level+1);
    nodes[1].setParams(top, midY, midX, right, this, level+1);
    nodes[2].setParams(midY, bottom, left, midX, this, level+1);
    nodes[3].setParams(midY, bottom, midX, right, this, level+1);

    //moves bodies into subnodes
    var index;
    for(i=bodies.length-1;i>=0;i--){
        if((index = getIndexOf(bodies[i])) != -1) {
            nodes[index].insert(bodies[i]);
            bodies.splice(i, 1);
        }
    }
} //end split()

function insert(body) {
    bodyCount++;

    if(!nodes){
        //leaf
        bodies.push(body);
        if(bodyCount > QuadTree.SPLIT_LIMIT && level < QuadTree.MAX_LEVELS)
            split();
    }else{
        var index = getIndexOf(body);
        if(index >= 0)
            nodes[index].insert(body);
        else
            bodies.push(body);
    }
}

function migrateBodies(){
    var orphans = [];
    var i, index;

    if(!nodes){
        // leaf case
        for(i=bodies.length-1;i>=0;i--){
            var b = bodies[i];
            if(!inBounds(b) && level > 0){
                orphans.push(b);
                bodies.splice(i, 1);
            }
        }
        return orphans;
    }

    // get any wayward bodies from child nodes
    orphans = nodes[0].migrateBodies().concat(nodes[1].migrateBodies(),
        nodes[2].migrateBodies(), nodes[3].migrateBodies());

    var lastLowerOrphan = orphans.length -1;

    //bodies -> orphans
    //bodies -> children
    for(i=bodies.length-1;i>=0;i--){
        if(!inBounds(bodies[i]) && level > 0){
            orphans.push(bodies[i]);
            bodies.splice(i, 1);
        }else if((index = getIndexOf(bodies[i])) != -1){
            nodes[index].insert(bodies[i]);
            bodies.splice(i, 1);
        }
    }

    //orphans -> bodies
    // place them into other child nodes, where possible
    for(i=lastLowerOrphan;i>=0;i--){ //only the orphans added from below could end up at this level
        if(inBounds(orphans[i])){
            bodies.push(orphans[i]);
            orphans.splice(i, 1);
        }
    }

    // unsplit if nodes left below here are few
    bodyCount -= orphans.length;
    if(bodyCount <= QuadTree.UNSPLIT_LIMIT)
        unsplit();

    return orphans;
}

///merges all objects from descendents into this one ([this] becomes a leaf)
function unsplit(){
    if(!nodes){
        var returnbods = bodies;
        bodies = [];
        return returnbods;
    }

    for(var i=0;i<nodes.length;i++){
        var bodiesBelow = nodes[i].unsplit();
        for (var j = 0; j < bodiesBelow.length; j++)
            bodies.push(bodiesBelow[j]);
    }
    QuadTree.nodeCache.push(nodes); // pushes a pack of 4 uneeded nodes into the cache
    nodes = null;

    //at this point, this node is a leaf

    return bodies;
}

    //2 4 5
    //

///find which subnode index (0-3) obj belongs in. -1 for none
function getIndexOf(body){
  var idx = 0;
  if(body.top() > midY){
    //entirely in bottom row
    idx = 2;
  } else if(body.bottom() > midY) return -1;

  if(body.left() > midX){
    //entirely in right column
    idx++;
  }else if(body.right() > midX) return -1;

  return idx;
}

function inBounds(b){
    return (b.top() > top && b.bottom() < bottom && b.left() > left && b.right() < right)
}

function describe(ctx){
    if(ctx){
        ctx.beginPath();
        ctx.rect(left, top, right-left, bottom-top);
        ctx.stroke();
        for(var i=0;i<bodies.length;i++) {
            ctx.beginPath();
            ctx.moveTo((left+right)/2, (top+bottom)/2);
            ctx.lineTo(bodies[i].x, bodies[i].y);
            ctx.stroke();
        }
    }else
        console.log("node level:"+level+" bodies:"+bodies.length+" bounds:"+[top, bottom, left, right]+" mids:"+[midX, midY]);
    for(var i=0;i<bodies.length;i++)
        if (!ctx) console.log("body "+[bodies[i].top(), bodies[i].bottom(), bodies[i].left(), bodies[i].right()]);
    if(nodes){
        for(var i=0;i<nodes.length;i++)
            nodes[i].describe(ctx);
    }
}

return {
    setParams: setParams,
    insert: insert,
    migrateBodies: migrateBodies,
    checkCollisions: checkCollisions,
    unsplit: unsplit,
    describe: describe
};

}
window.QuadTreeNode = QuadTreeNode;
}(window));

(function(window){

    var approachCount = 0;

    function BodyManager(canvasNode){
        this.renderingContext = canvasNode[0].getContext("2d");
        this.collisionDetector = new QuadTree(1200, 1600);

        this.collisionDetector.approachCallback(function(b1, b2){
            approachCount++;
            var dist = Math.sqrt(Math.pow(b1.x-b2.x, 2) + Math.pow(b1.y-b2.y, 2));
            if(isNaN(dist)) return;

            b1.actOn(b2, dist);
            b2.actOn(b1, dist);
        });

        this.bodies = [];
        //for(var i=0;i<60;i++){
        //    var ball = new Ball();
        //    ball.x = 80+(6*i)%100;
        //    ball.y = 40 + i/;
        //    ball.color = 'blue';
        //    ball.r = 5;
        //    this.bodies.push(ball);
        //    this.collisionDetector.insert(ball);
        //}

    }

    BodyManager.prototype.addBall = function(obj){
        var ball = new Ball();
        ball.x = obj.positionX;
        ball.y = obj.positionY;
        ball.color = obj.color;
        ball.r = obj.size;

        this.bodies.push(ball);
        this.collisionDetector.insert(ball);
    };

    BodyManager.prototype.addWall = function(obj){
        var wall = new Wall();
        wall.x = obj.xStart;
        wall.y = obj.yStart;
        wall.x1 = obj.xEnd;
        wall.y1 = obj.yEnd;

        wall.recompute();

        this.bodies.push(wall);
        this.collisionDetector.insert(wall);
    };

    BodyManager.prototype.gravityChange = function(color, dir){
        var eInd = -1;
        var y = dir > 0 ? -1 : 100000 ;
        for(var i=0;i<this.bodies.length;i++){
            var b = this.bodies[i];

            if(dir > 0) {
                if (b.color == color && b.g * dir < 0 && b.y * dir > y) {
                    y = b.y;
                    eInd = i;
                }
            }else {
                if (b.color == color && b.g * dir < 0 && b.y < y) {
                    y = b.y;
                    eInd = i;
                }
            }
        }

        console.log(eInd);
        if(eInd >=0)
            this.bodies[eInd].g = Math.abs(this.bodies[eInd].g) * dir;

    };

    BodyManager.prototype.doUpdate = function(dt){
        if(!dt) return;
        approachCount = 0;
        var i;
        for(i=0;i<this.bodies.length;i++){
            this.bodies[i].update(dt);
        }
        this.collisionDetector.detect();
        //console.log("approach count "+approachCount);
        this.drawFrame(this.renderingContext);
    };

    BodyManager.prototype.drawFrame = function(ctx){
        ctx.clearRect(0, 0, 1600, 1200);
        for(var i=0;i<this.bodies.length;i++){
            this.bodies[i].draw(ctx);
        }
        //this.collisionDetector.describe(ctx);
    };

    BodyManager.prototype.describe = function(){
        this.collisionDetector.describe();
    };


	window.BodyManager = BodyManager;
	
}(window));

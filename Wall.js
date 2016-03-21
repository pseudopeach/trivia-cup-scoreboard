(function(window){

    function Wall(){
        this.x = 0.0;
        this.y = 0.0;
        this.x1 = 1.0;
        this.y1 = 1.0;
        this.x = 0.0;
        this.y = 0.0;
        this.l = 1.0;
    }

    Wall.prototype.recompute = function(){
        this.oTop = Math.min(this.y, this.y1);
        this.oBottom = Math.max(this.y, this.y1)+1;
        this.oLeft = Math.min(this.x, this.x1);
        this.oRight = Math.max(this.x, this.x1)+1;
        this.dx = this.x1 - this.x;
        this.dy = this.y1 - this.y;
        this.l = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));

        this.dx /= this.l;
        this.dy /= this.l; //unit direction vector

        //this.nx = -this.dy;
        //this.ny = this.dx;
    };

    Wall.k = 80.0;
    Wall.c = 3.0;

    Wall.prototype.top = function()
        {return this.oTop;};
    Wall.prototype.bottom = function()
        {return this.oBottom;};
    Wall.prototype.left = function()
        {return this.oLeft;};
    Wall.prototype.right = function()
        {return this.oRight;};

    Wall.prototype.actOn = function(other, l){
        var rx = other.x - this.x;
        var ry = other.y - this.y;
        var r2 = Math.pow(rx, 2) + Math.pow(ry, 2);
        var dp = rx*this.dx + ry*this.dy; // parallel distance from p0
        var dl = Math.sqrt(r2 - Math.pow(dp, 2)); // lateral distance from p0

        // check if it's actually near the segment
        if(dl > other.r) return;
        if(dp > this.l + other.r || dp < -other.r) return;

        var d;
        if(dp > 0.0 && dp < this.l){
            // collision along segment middle
            d = other.r - dl;
            d = dl < 1.0 ? d : Math.pow(d, 3);

            var dir = this.dx*ry - this.dy*rx > 0.0 ? 1.0 : -1.0; // 2D cross product
            var nx = -this.dy*dir;
            var ny = this.dx*dir;

            other.fx += Wall.k*d*nx*other.m;
            other.fx += Wall.c*other.vx*nx*other.m;

            other.fy += Wall.k*d*ny*other.m;
            other.fy += Wall.c*other.vy*ny*other.m;
        }else{
            // collision in "endcap areas"
            var x, y;
            if(dp < 0.0){
                // tail end
                d = (other.r - l);
                if(d < 0.0) return; // ball is not in contact
                d = d < 1.0 ? d : Math.pow(d, 3);
                x = this.x; y=this.y;
            }else{
                // head end
                l = Math.sqrt(Math.pow(other.x-this.x1, 2) + Math.pow(other.y-this.y1, 2));
                d = (other.r - l);
                if(d < 0.0) return; // ball is not in contact
                d = d < 1.0 ? d : Math.pow(d, 3);
                x = this.x1; y=this.y1;
            }
            other.fx += Wall.k*d*(other.x - x)/l;
            other.fx -= Ball.c*other.vx/l;

            other.fy += Wall.k *d*(other.y - y)/l;
            other.fy -= Ball.c*other.vy/l;
        }


    };

    Wall.prototype.update = function(dt){
        this.fx = 0;
        this.fy = 0;
    };

    Wall.prototype.draw = function(ctx){
        //ctx.beginPath();
        //ctx.moveTo(this.x, this.y);
        //ctx.lineTo(this.x1, this.y1);
        //ctx.stroke();
    };

    window.Wall = Wall;
	
}(window));

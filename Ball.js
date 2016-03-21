(function(window){

    function Ball(){
        this.x = 0.0;
        this.y = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.fx = 0.0;
        this.fy = 0.0;
        this.r = 1.0;
        this.m = 4.0;
        this.g = -100.0; //gravity up
        this.color = "#000000";
    }

    Ball.k = 25.0;
    Ball.c = c = 16.5*Math.sqrt(Ball.k);

    Ball.prototype.actOn = function(other, l){
        var d = (other.r + this.r - l);
        if(d <= 0.0) return;

        d = d < 1.0 ? d : Math.pow(d, 3);

        if(l < 2.0){
            console.log("fucked");
        }

        other.fx += Ball.k*d*(other.x - this.x)/l;
        other.fx += Ball.c*(this.vx - other.vx)/l;

        other.fy += Ball.k*d*(other.y - this.y)/l;
        other.fy += Ball.c*(this.vy - other.vy)/l;

    };

    Ball.prototype.update = function(dt){
        if(isNaN(this.fx) || isNaN(this.fy)){
            this.color = "red";
            this.fx = 0; this.fy = 0;
        }

        this.vx += dt * this.fx / this.m;
        this.vy += dt * this.fy / this.m;

        if(this.vx > 150) this.vx = 150;
        if(this.vx < -150) this.vx = -150;
        if(this.vy > 150) this.vy = 150;
        if(this.vy < -150) this.vy = -150;

        if(this.x > 150000) this.x = 150000;
        if(this.x < -150000) this.x = -150000;
        if(this.y > 150000) this.y = 150000;
        if(this.y < -150000) this.y = -150000;

        this.x += dt * this.vx;
        this.y += dt * this.vy;


        this.fx = 0.0;
        this.fx -= 2.5*this.vx;
        this.fy = this.g;
        this.fy -= 2.5*this.vy;
    };

    Ball.prototype.draw = function(ctx){
        //draw circle
        //var ctx = $('#canvas')[0].getContext("2d");

        //draw a circle
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, true);

        ctx.fill();
        ctx.stroke();
        //console.log("drew circle "+this.x+","+this.y+"  "+this.r);
    };

    Ball.prototype.top = function(){
        return this.y - this.r;
    };
    Ball.prototype.bottom = function(){
        return this.y + this.r;
    };
    Ball.prototype.left = function(){
        return this.x - this.r;
    };
    Ball.prototype.right = function(){
        return this.x + this.r;
    };

    window.Ball = Ball;
	
}(window));

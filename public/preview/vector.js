var NOW = function(){
    return Number(new Date()) / 1000;
};
var Vector = (function(){
    var Vector = function(x, y){
        if (x < -1000000){
            return 'too small'.debug();
        }
        this.x = x || 0;
        this.y = y || 0;
    };
    Vector.prototype.log = function(msg){
        console.log(msg + '<' + this.x + ', ' + this.y + '>');
    };
    Vector.prototype.add = function(other){
        return new Vector(this.x + other.x, this.y + other.y);
    };
    Vector.prototype.sub = function(other){
        return new Vector(this.x - other.x, this.y - other.y);
    };
    Vector.prototype.scale = function(factor){
        return new Vector(this.x * factor, this.y * factor);
    };
    return Vector;
})();


ORIGIN = new Vector(0, 0);


var Movement = (function(){
    var Movement = function(a, b, endtime, starttime){
        this.a = a || ORIGIN;
        this.b = b || a;
        if (starttime === undefined) starttime = NOW();
        if (endtime === undefined) endtime = starttime;
        if (endtime < starttime){
            console.log('error: endtime < starttime');
        }
        this.f = function(t){
            if (t < starttime) return 0;
            if (t >= endtime) return 1;
            return (t - starttime) / (endtime - starttime);
        };
    };
    Movement.prototype.eval = function(t){
        var dv = this.b.sub(this.a);
        var factor = this.f(t);
        var ray = dv.scale(factor);
        var pos = this.a.add(ray);
        return pos;
    };
    return Movement;
})();

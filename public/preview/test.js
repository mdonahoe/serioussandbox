LOG = function(x){
    document.body.innerHTML += '<div>' + x + '</div>';
};
T = function(test, msg){
    var result;
    if (test) {
        result = 'ok';
    } else {
        result = 'FAIL';
    }
    LOG(result + ": " + msg);
};

ZERO = function(value, msg){
    T(value === 0, msg + ' (' + value + ')');
};
NEARLYZERO = function(value, msg){
    var x = Math.floor(value * 100) / 100;
    ZERO(x, msg);
};

(function(){
    var zero = new Vector();
    T(zero.x === 0 && zero.y === 0, 'empty');
    var v = new Vector(1,2);
    T(v.x === 1 && v.y === 2, 'with args');
    var scaled = v.scale(5);
    T(scaled.x === 5 && scaled.y === 10, 'scaled');

    var sumA = zero.add(v);
    T(sumA.x == 1 && sumA.y == 2, 'addition identity');
    var sumB = v.add(zero);
    T(sumA.x == sumB.x && sumA.y == sumB.y, 'commutative');
    var sumC = v.sub(new Vector(3, 7));
    T(sumC.x === -2 && sumC.y === -5, 'subtraction');
    var z = (new Vector(1,2)).sub(new Vector(3,4)).scale(5).add(new Vector(6,7));
    T(z.x == -4 && z.y == -3, 'complicated');

    // fake it with simple times
    var m = new Movement(new Vector(33,0), new Vector(77,0), 100, 0);
    ZERO(m.f(0), 'time start');
    ZERO(m.f(25) - .25, 'time low');
    ZERO(m.f(50) - .5, 'time mid');
    ZERO(m.f(75) - .75, 'time high');
    ZERO(m.f(100) - 1, 'time end');
    ZERO(m.f(-100), 'before start');
    ZERO(m.f(1000) - 1, 'after start');

    ZERO(m.eval(0).x - 33, 'movement start');
    ZERO(m.eval(50).x - 55, 'movement mid');
    ZERO(m.eval(100).x - 77, 'movement end');

    // try *REAL* times
    var t = NOW();
    var m2 = new Movement(new Vector(), new Vector(), t + 3, t);
    NEARLYZERO(m2.f(NOW()), '0/3');
    setTimeout(function(){
        NEARLYZERO(m2.f(NOW()) - .333, '1/3');
    }, 1000);
    setTimeout(function(){
        NEARLYZERO(m2.f(NOW()) - .666, '2/3');
    }, 2000);
    setTimeout(function(){
        NEARLYZERO(m2.f(NOW()) - 1, '3/3');
    }, 3000);
    setTimeout(function(){
        NEARLYZERO(m2.f(NOW()) - 1, '5/3');
    }, 5000);

    // basic, no duration movement
    var m0 = new Movement();
    ZERO(m0.f(NOW()) - 1, 'blank');
    setTimeout(function(){
        ZERO(m0.f(NOW()) - 1, 'still blank');
    }, 1000);

}());

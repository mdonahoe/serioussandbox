var TimeBomb = (function(){
// i thought this would be more useful
// but right now only the Spawn action uses it
    var dead = function(){
        console.log('I am a ghost!');
    };

    function TimeBomb(callback){
        this.n = 0;
        this.callback = callback;
    };
    TimeBomb.prototype.wind = function(){
        this.n += 1;
    };
    TimeBomb.prototype.tick = function(){
        this.n -= 1;
        if (this.n == 0){
            this.callback();
            this.callback = dead;
        }
    };
})();

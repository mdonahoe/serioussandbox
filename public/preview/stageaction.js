/*
 the directing system
*/

ERROR = function(msg){
    console.log(msg)
};

ACTION_IN_PROGRESS = 1 // anything truthy

var direct = function(stage, action, completionCallback){
    var act = StageActions[action[0]];
    if (act){
        return act(stage, action, completionCallback);
    } else {
        ERROR('undefined action: ' + action[0]);
    }
};


// `s` is for the StageManager
// `p` is for the parameters
// `p[0]` is always the name of the action
// the rest are action dependent

StageActions = {
    Put:function(s, p){
        var pos = slotspot_to_pos(p[2]);
        s.add_character(p[1]).set_movement(new Movement(new Vector(pos.x, pos.y)));
    },
    Walk:function(s, p, done){
        var c = s.add_character(p[1]);
        c.behave('walk');
        // wrap the done in a stop
        var wrapped = function(){
            c.behave('idle');
            done();
        }
        return StageActions.Move(s, p, wrapped);
    },
    Remove:function(s, p){
        s.remove_character(p[1]);
    },
    Move:function(s, p, done){
        var character = s.add_character(p[1]);
        var dest = slotspot_to_pos(p[2]);
        var distance = dest.x - character.get_position().x;
        var speed = p[3] || 140.0;
        var duration = Math.abs(distance/speed);
        if (duration < 0){
            ERROR('time travel is possible apparently');
            return ACTION_IN_PROGRESS;
        }

        // move character over time (updating every frame)
        var t = s.time();
        var move = new Movement(character.get_position(), dest,
                                t + duration, t);
        character.set_movement(move);

        // this should be controlled differently,
        // since it means we are using a different timer
        setTimeout(done, duration * 1000);

        return ACTION_IN_PROGRESS;
    },
    Pan:function(s, p, done){
        ERROR('no camera in this mode, suckers!')
        // do the time?
    },
    Behave:function(s, p){
        s.get_character(p[1]).behave(p[2]);
    },
    Face:function(s, p){
        ERROR('go face yourself, dick.');
    },
    Wait:function(s, p, done){
        setTimeout(done, p[1] * 1000);
    },
    Spawn:function(s, p, done){
        // each other parameter is a sub action that should execute simulataneously
        var dead = function(){
            'whoops'.debug();
        };
        var waits = 0;
        var wrapped = function(){
            waits -= 1;
            if (waits > 0) return;
            done();
            done = dead; // safety check
        };
        // wait until all actions are complete
        // give them a function to call
        for (var i=1; i<p.length; i++){
            waits += 1;
            var wait = direct(p[i], wrapped);
            if (!wait) waits-=1;
        };
        if (waits) return ACTION_IN_PROGRESS;
    },
    Sequence:function(s, p, done){
        var queue = [];
        for (var i=1;i<p.length;i++){
            queue.push(p[i]);
        };
        var f = function(){
            var act = queue.shift();
            if (!act) return done();
            var wait = direct(s, act, f);
            if (!wait) return f();
            return ACTION_IN_PROGRESS;
        };
        return f();
    },
};

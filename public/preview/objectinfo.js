/*
Object Info Manager (ghetto!)

*/

var INFO = {};
var FETCH_INFO = function(callback){
    $.ajax({
        url:"/info.json?exclude=Story&exclude=Chapter",
        type:"GET",
        cache:false,
        data:{},
        dataType:"json",
        success:function(data){
            LOAD_INFO(data);
            callback();
        },
        error:function(_,estatus,ethrown){
            alert('unable to fetch infos');
        }
    });
};

var INSERT_INFO_CLASSES = function(infos){
    for (var kind in infos){
        INFO[kind] = (function(_kind){
            return function(key){
                var x = infos[_kind][key];
                if (x === undefined){
                    ERROR('INFO.' + _kind + ' has no object for key ' + key);
                    return {}; //template for kind?
                }
                return x;
            };
        })(kind);
    }
};

var LOAD_INFO = function(infos){
    console.log('infos loaded');
    INFO = {};
    INSERT_INFO_CLASSES(infos);
};

// should know how to fetch infos?
// host/info.json?exclude=Chapter&callback=LOAD_INFO

// should also handle fetching of assets?

var random_key = function(obj){
    var N = 1;
    var chosen = undefined;
    for (var key in obj) {
        var p = Math.random();
        if (p <= 1.0 / N) {
            chosen = key;
        }
        N++;
    }
    return chosen;
};

var _current = {};
var RANDOM = function(klass){
    var current = _current[klass];
    var pick;
    for (var i=0; i < 10; i++){
        pick = random_key(INFO[klass]);
        if (pick != current) break;
    }
    _current[klass] = pick;
    return pick;
};

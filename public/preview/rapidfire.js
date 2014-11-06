var REGEX = (function(){
    indent = '[ ]{8}'
    name = '([A-Z0-9 ]+)'
    points = '([ ]([+-]\\d))?'
    behave = '([ ]\\(([A-Za-z0-9,_]+)\\))?'
    return RegExp(indent + name + points + behave + points + '$');
})();

var match = function(line){
    var m = REGEX.exec(line);
    if (!m) return null;
    var x = {};
    x.character = m[1];
    x.points = m[3] || m[7];
    x.behavior = m[5];
    return x;
}

LINES = false;
current = {};
var load_chapter = function(chapter){
    LINES = chapter.source.split('\n');
    show_speaker();
}

var find_nearest_speaker = function(index, only_if_missing){
    for (var i=index;i<LINES.length;i++){
        var line = LINES[i];
        var c = match(line);
        if (!c) continue;
        if (c.character == 'NARR' || c.character == 'NARRATOR') continue;
        if (only_if_missing && c.behavior) continue;
        c.dialog = LINES[i+1];
        c.index = i;
        return c;
    }
    return null;
}

var show_speaker = function(index){
    if (index == undefined) index = 0;
    current = find_nearest_speaker(index, true);
    if (!current){
        alert('Reached the end of this chapter. Save your work!');
        return;
    }
    $('#character').html(current.character);
    $('#dialog').html(current.dialog);
    setup(4);
}

var format_speaker = function(x){
    var s = '        ' + x.character;
    if (x.points){
        s += ' ' + x.points;
    }
    if (x.behavior){
        s += ' (' + x.behavior + ')';
    }
    return s;
}

var select_behavior = function(behavior_id){
    // find the animation
    console.log('selected: ' + behavior_id);
    current.behavior = behavior_id;
    var behavior = BEHAVIORS[current.behavior];
    var character = CHARACTERS[current.character];
    var animID;
    if (character.gender == "m"){
        animID = behavior.maleAnimation;
    } else {
        animID = behavior.girlAnimation;
    }
    var animation = ANIMATIONS[animID];
    console.log('fileane = ' + animation.filename);
    start('dcon/' + animation.filename + '.json')
}

var next = function(){
    console.log('assigned: ' + current.behavior);
    LINES[current.index] = format_speaker(current);
    show_speaker(current.index + 1)
}

ANIMATIONS = BEHAVIORS = CHARACTERS = false;

var load_behaviors = function(map){
    BEHAVIORS = map;
    setup(1);
}
var load_animations = function(map){
    ANIMATIONS = map;
    setup(2);
}

var load_characters = function(map){
    CHARACTERS = {};
    for (var i in map){
        var c = map[i];
        CHARACTERS[c.name] = c;
    }
    setup(3);
}

setup = function(n){
    if (!ANIMATIONS || !BEHAVIORS || !CHARACTERS || !LINES){
        console.log('waiting ' + n);
        return;
    }
    tags_from_behaviors();
    list_matching_behaviors();
}

INCLUDE_TAGS = {};
EXCLUDE_TAGS = {'legacy':1};

list_matching_behaviors = function(){
    var matching = [];
    for (var i in BEHAVIORS){
        var behavior = BEHAVIORS[i];
        if (does_behavior_fit(behavior)){
            matching.push(behavior);
        }
    }
    var buttons = [];
    for (var i in matching){
        var behavior = matching[i];
        var id = behavior.identifier;
        var b = '<input type=button value="' + id +
                '" onclick="select_behavior(\'' + id +
                '\');">';
        buttons.push(b);
    }
    buttons.sort();
    $('#behavior_list').html(buttons.join('\n'));
}

does_behavior_fit = function(behavior){
    var tags = (behavior.tags || '').split('|');
    var tagmap = {};
    for (var t in tags){
        var tag = tags[t];
        tagmap[tag] = 1;
    }

    // ok, now check all the included and excluded tags
    for (var exclude in EXCLUDE_TAGS){
        if (exclude in tagmap){
            return false;
        }
    }
    for (var include in INCLUDE_TAGS){
        if (!(include in tagmap)){
            return false;
        }
    }
    // final check: is this behavior implemented for the current gender?
    var character = CHARACTERS[current.character];
    if (character.gender == 'm' && behavior.maleAnimation == 'tbd') return false;
    if (character.gender == 'f' && behavior.girlAnimation == 'tbd') return false;

    // all clear!
    return true;
}

TAGS = {}
var tags_from_behaviors = function(){
    // present
    for (var i in BEHAVIORS){
        var behavior = BEHAVIORS[i];
        var tags = (behavior.tags || '').split('|');
        for (var j in tags){
            var tag = tags[j];
            if (tag.length == 0) continue;
            TAGS[tag] = 1;
        }
    }
    var buttons = [];
    for (var tag in TAGS){
        var prefix = '';
        if (tag in INCLUDE_TAGS){
            prefix = 'YES ';
        } else if (tag in EXCLUDE_TAGS){
            prefix = 'NO ';
        }
        var s = '<input type=button id="tag_' + tag + '" ' +
                'value="' + prefix + tag + '" ' +
                'onclick="select_tag(\'' + tag + '\');">';
        buttons.push(s);
    }
    buttons.sort();
    $('#tag_list').html(buttons.join('\n'));
}

var select_tag = function(tag){
    var a = (tag in INCLUDE_TAGS);
    var b = (tag in EXCLUDE_TAGS);
    if (a && b){
        alert('ERROR: tag in both INCLUDE and EXCLUDE');
    } else if (a) {
        // switch to exclude
        $('#tag_' + tag).val('NOT ' + tag);
        EXCLUDE_TAGS[tag] = 1;
        delete INCLUDE_TAGS[tag];
    } else if (b) {
        // switch to off
        $('#tag_' + tag).val(tag);
        delete EXCLUDE_TAGS[tag];
    } else {
        // switch to include
        $('#tag_' + tag).val('YES ' + tag);
        INCLUDE_TAGS[tag] = 1;
    }
    list_matching_behaviors();
}


fetch = function(){
    $.ajax({
        url:"/parse/",
        type:"GET",
        cache:false,
        data:{
            story_id:story_id,
            chapter_name:chapter_name,
            },
        dataType:"json",
        success:function(output){
            load_chapter(output);
        },
        error:function(_,estatus,ethrown){
            alert('unable to load chapter. refresh browser or contact matt');
        }
    });
}

save = function(){
    parse(LINES.join('\n'));
}
parse = function(source){
    // send revision number?
    $.ajax({
        url:"/parse/",
        timeout:10000, // 10 seconds
        type:"POST",
        data:{
            story_id:story_id,
            chapter_name:chapter_name,
            source:source
            },
        dataType:"json",
        success:function(output){
            window.location.href="/story/" + story_id + "/" + chapter_name + "/";
        },
        error:function(_, estatus, ethrown){
            var msg = 'Unable to parse!\n';
            msg += 'Get help!';
            msg += '(' + estatus + ': ' + (ethrown||'unknown') + ')';
            alert(msg);
        },
    });
}

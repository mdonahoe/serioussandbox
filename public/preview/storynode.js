// All the StoryNodes
var story_node_factory = function(json){
    // attempt to get the class... *crosses fingers*
    var klass = window[json.c || 'StoryNode'];
    if (!klass) {
        klass = UnsupportedNode;
    }
    return new klass(json);
};

var BaseNode = Class.extend({
    init:function(json){
        this.key = json.k;
        this.nextKey = json.e;
        this.klass = json.c || 'BaseNode';
    },
    execute_on_stage:function(stage){
        stage.log('showing ' + this.klass + ': ' + this.key);
    },
    next:function(stage){
        return stage.nodeMap[this.nextKey];
    },
});

var StoryNode = BaseNode.extend({
    init:function(json){
        this._super(json);
        this.klass = 'StoryNode';
        this.dialog = json.d;
        this.placeID = json.b;
        this.characterID = json.p;
        this.behaviorID = json.a;
        /* currently unsupported in this client
        this.position = json.xy;
        this.points = json.pts;
        this.music = json.m;
        this.fx = json.fx;
        this.facing = json.face;
        */
    },
    execute_on_stage:function(stage){
        this._super(stage);

        // HACK for dialog
        var name = INFO.Character(this.characterID).displayName || 'NARRATOR';
        $('#bubbletext').html(name + ':' + this.dialog);
        // todo: draw speech bubble in canvas instead

        stage.adjust_scene(this);
        stage.get_character(this.characterID).behave(this.behaviorID);
    }
});

var DirectorNode = BaseNode.extend({
    init:function(json){
        this._super(json);
        this.action = json.action;
        ERROR(JSON.stringify(this.action));
    },
    execute_on_stage:function(stage){
        this._super(stage);
        direct(stage, this.action, stage.advance);
    },
});

var ChoiceNode = StoryNode.extend({
    init:function(json){
        this._super(json);
        // TODO: make this for real
        // currently this is a hack
        this.nextKey = json.es[0];
        this.dialog += ' (choices hidden, just tap)';
    },
    execute_on_stage: function(stage){
        this._super(stage);
        // TODO: show buttons!
    }
});

var UnsupportedNode = StoryNode.extend({
    init:function(json){
        this._super(json);
    },
    execute_on_stage:function(stage){
        // treat unsupported nodes as no-op
        stage.advance();
    }
});

var BranchNode = UnsupportedNode.extend({
    init:function(json){
        this._super(json);
        // TODO: make this for real
        // currently this is a hack
        this.nextKey = json.es[0];
    },
});

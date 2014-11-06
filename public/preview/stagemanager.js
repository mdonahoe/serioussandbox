function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
};
var StageManager = (function(){
    var StageManager = function(stage){
        this.stage = stage;
        this.currentNode = null;
        this.nodeMap = null;
    };
    StageManager.prototype.time = function(){
        return this.stage.time();
    };
    StageManager.prototype.log = function(message){
        console.log(message);
    };
    StageManager.prototype.get_character = function(characterID){
        if (!characterID) return;
        if (characterID == 'NARR' || characterID == 'NARRATOR'){
            return {behave:function(){}, displayName:'NARRATOR'};
        }
        return this.stage.actors[characterID];
    };
    StageManager.prototype.adjust_scene = function(adjustments){
        this.add_character(adjustments.characterID);
        if (adjustments.placeID){
            var url = '/dcon/' + INFO.Place(adjustments.placeID).imageFilename;
            this.stage.backdrop = new Image();
            this.stage.backdrop.src = url;
        }
        // TODO: music and sound fx adjustments
    };
    StageManager.prototype.add_character = function(characterID){
        var character = this.get_character(characterID);
        if (character) return character;
        var character = new Character(characterID);
        character.behave('idle');
        this.stage.actors[characterID] = character;
        return character
    };
    StageManager.prototype.remove_character = function(characterID){
        // unlikely that this will work.
        delete this.stage.actors[characterID];
    };
    StageManager.prototype.advance = function(){
        var next = this.currentNode.next(this);
        if (!next) {
            alert('End of preview!');
            return;
        }
        this.transition(next);
    };
    StageManager.prototype.transition = function(node){
        if (!node){
            TRACE();
        };
        this.currentNode = node;
        node.execute_on_stage(this);
    };
    StageManager.prototype.play = function(chapter){
        assert(!this.currentNode);
        function parse(chapter){
            var nodes = {};
            for (var i in chapter.nodes){
                var node = story_node_factory(chapter.nodes[i]);
                nodes[node.key] = node;
            }
            return nodes;
        };
        this.nodeMap = parse(chapter);
        this.transition(this.nodeMap["0"]);
    };
    return StageManager;
})();

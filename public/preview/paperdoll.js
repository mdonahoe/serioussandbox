/*

--- JAVASCRIPT PAPERDOLLS ---

An Animation, aka a paper doll animation, has:
1. A list of named layers, confusing called "animations"
2. A childParentMapping for layers to be inside others.
3. A duration
4. A name


Each Layer has:
1. A name
2. An associated body part
3. A list of frames to be animated over time

Note:
Only one frame should exist for each layer at a single point in time.
Behavior is undefined for overlapping frames of the same bodypart.

Each Frame has:
1. Initial state (x, y, rotation, scale)
2. Start time
3. A duration
4. A z-order for determine draw relationship to other layers.
5. Optional motion parameters (scaleBy, rotateBy, etc)


Some classes are defined:
Sprite - an image that lives inside a texture atlas
Collection - a texture atlas where the pieces are referenced by bodypart names
BodyPart - a moveable sprite with children
PaperDoll - a collection of bodyparts that wears apparel and plays animations
Animation - how to move bodyparts over time
Stage - a container for multiple paperdolls
Display - a double-buffered canvas. Injects itself into a div


Missing:
    - apparelTypes with custom zOrder
    - subtle differences since we dont have BodyPart.csv
    - mipmap support (ie, retina)
*/


var PaperDoll = (function(){
// --- An animatable collection of bodyparts --- //
    function PaperDoll(atlas){
        this.collection = new Collection(atlas);
        this.bodyparts = {};
        this.animation = null;
        for (var name in this.collection.parts){
            var sprite = this.collection.parts[name];
            this.bodyparts[name] = new BodyPart(name, sprite);
        }
        this._active_parts = [];  // cached on update()
        this.x = 100;
        this.y = 400;
    };

    PaperDoll.prototype.wear = function(apparel){
        // attach to all the subparts
        for (var name in apparel.parts){
            var sprite = apparel.parts[name];
            var bodypart = this.get_part(name);
            if (!bodypart) continue;
            bodypart.apparelParts.push(sprite);
        }
    };

    PaperDoll.prototype.clear_apparel = function(){
        // reset apparelParts
        for (var name in this.bodyparts){
            var bodypart = this.bodyparts[name];
            bodypart.apparelParts = [];
        }
    };

    PaperDoll.prototype.update = function(t){
        if (!this.animation) {
            console.log('no animation, no draw');
            return;
        }

        // handle loop logic here... grrr
        // does this animation even loop?
        // record a start time?
        if (t > this.animation.duration) {
            t = t % this.animation.duration;
        }

        // update all properties
        this._active_parts = [];
        var frames = this.animation.active_frames(t);
        for (var name in frames){
            var frame = frames[name];
            var bodypart = this.get_part(name);
            if (bodypart){
                bodypart.update(frame, t);
                if (name in this.animation.childParentMapping){
                    // no-op... our parent will draw us
                } else {
                    this._active_parts.push(bodypart);
                }
            }
        }

        this._active_parts.sort(function(a,b){
            var x = a.zOrder || 0;
            var y = b.zOrder || 0;
            if (x < y) return -1;
            if (x > y) return 1;
            return 0;
        });
    };

    PaperDoll.prototype.draw = function(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        for (var i in this._active_parts){
            var bodypart = this._active_parts[i];
            bodypart.draw(ctx);
        }

        ctx.restore();
    };

    PaperDoll.prototype.get_part = function(name){
        if (name in this.bodyparts){
            return this.bodyparts[name];
        }

        // lame hack for skirtSkinny, skirtPoofy
        // TODO: real fix involves BodyPart.csv
        var regex = /skirt(Poofy|Skinny)_(.*)/;
        if (name.match(regex)){
            return this.bodyparts[name.match(regex)[2]];
        }

        WARNING('unable to find part ' + name);
    }

    PaperDoll.prototype.perform = function(animation){
        // reset all parts
        for (var name in this.bodyparts){
            this.bodyparts[name].children = [];
        }

        // attach child parts to parents for this animation
        var mapping = animation.childParentMapping;
        for (var childName in animation.childParentMapping){
            var parentName = animation.childParentMapping[childName];
            var parentPart = this.get_part(parentName);
            var childPart = this.get_part(childName);
            parentPart.children.push(childPart);
        }

        // remember what we are doing
        this.animation = animation;
    }

    return PaperDoll;
})();


var Collection = (function(){
// --- atlas with filenames that match back to bodyparts
    function Collection(atlas){
        // get the texture for the atlas
        this.texture = new Image();
        var textureFilename = atlas.metadata.textureFileName;
        this.texture.src = TEXTURE_PNG_PATH + textureFilename;

        this.parts = {};
        // TODO: use the BodyPart.csv "filenameScheme", instead assuming
        var regex = /.*_(.*).png/;
        for (var filename in atlas.frames){
            var frame = atlas.frames[filename];
            var partname = filename.match(regex)[1];
            this.parts[partname] = new Sprite(frame, this.texture);
        }
        // TODO: drop body parts based on BodyPart.csv "bodyPartsDisconnect"
    };
    return Collection;
})();


var Animation = (function(){
// --- describes movements over time for bodyparts --- //
    function Animation(json){
        this.layers = json.animations; // i hate they call it "animations"
        this.childParentMapping = json.childParentMapping;
        this.gender = json.gender;
        this.duration = json.duration;
    };

    Animation.prototype.active_frames = function(t){
        var frames = {};
        for (var name in this.layers){
            var layer = this.layers[name];
            // get the frame active at time t
            var active_frame = null;
            for (var i in layer){
                var frame = layer[i];
                var start = frame.startTime || 0;
                var duration = frame.frameDuration || 0;
                var end = start + duration;
                if (t < start || t > end){
                    continue;
                }
                active_frame = frame;
                break;
            }
            if (active_frame){
                frames[name] = active_frame;
            }
        }
        return frames;
    };

    return Animation;
}());


var BodyPart = (function(){
// --- like Node in cocos, but specific to paperdolls --- //
    function BodyPart(name, sprite){
        this.name = name;
        this.sprite = sprite;

        this.apparelParts = []; // images layered on our sprite
        this.children = []; // other parts on top

        this.offset = {x:0, y:0};
        this.scale = {x:1, y:1};
        this.angle = 0;
        this.anchorPoint = {x:0, y:0};
        this.zOrder = 0;
        this._needsDraw = false;
    };

    BodyPart.prototype.update = function(frame, time){
        // change properties to match frame.

        this._needsDraw = true;
        var t = 0;
        if (frame.motion){
            t = (time - frame.startTime || 0) / frame.frameDuration;
        }

        this.offset = {
            x: (frame.initialX || 0) + t * (frame.moveByX || 0),
            y: (frame.initialY || 0) + t * (frame.moveByY || 0)
        }

        this.scale = {
            x: (frame.initialScaleX || 1) + t * (frame.scaleXBy || 0),
            y: (frame.initialScaleY || 1) + t * (frame.scaleYBy || 0)
        };

        this.angle = (frame.initialRotate || 0) + t * (frame.rotateBy || 0);

        this.anchorPoint = {
            x: frame.anchorX || 0,
            y: 1 - (frame.anchorY || 0)  // cocos2d is flipped from canvas
        };

        this.zOrder = frame.zOrder || 0;
    };

    BodyPart.prototype.draw = function(ctx){
        // hack to prevent drawing inactive parts
        if (!this._needsDraw) return;
        this._needsDraw = false;

        // i dont like that this is required.
        var size = this.sprite.size;

        ctx.save();

        // cp is where in the parent the lower-left corner of the image should be
        ctx.translate( this.offset.x, this.offset.y );
        ctx.rotate(-this.angle * Math.PI / 180 );
        ctx.scale(this.scale.x, -this.scale.y);
        ctx.translate(
            -this.anchorPoint.x * size.width,
            -this.anchorPoint.y * size.height
        )

        // actually draw the part
        this.sprite.draw(ctx);
        for (var i in this.apparelParts){
            this.apparelParts[i].draw(ctx);
        }

        // convert between the canvas and cocos2d coordinate system
        ctx.scale(1,-1);
        ctx.translate(0, -size.height);

        // draw sub-parts on top
        for (var i in this.children){
            // sort by z order?
            this.children[i].draw(ctx);
        }
        ctx.restore();
    };
    return BodyPart;
})();


var Sprite = (function(){
// --- a subimage in a larger texture --- //
    function Sprite(frame, texture){
        this.texture = texture;
        // frame comes straight from texturepacker
        // transform the data into more convenient form
        this.rotated = frame.rotated;

        this.frame = {
            origin: {
                x: frame.frame[0][0],
                y: frame.frame[0][1]
            },
            size: {
                width: frame.frame[1][0],
                height: frame.frame[1][1]
            }
        };

        this.size = {
            width: frame.sourceSize[0],
            height: frame.sourceSize[1]
        };

        this.offset = {
            x: this.size.width / 2 - (this.frame.size.width / 2) + frame.offset[0],
            y: this.size.height / 2 - (this.frame.size.height / 2) - frame.offset[1]  // note the minus! flipped vertical strikes again
        };
    };

    Sprite.prototype.draw = function(ctx){
        // draws at 0,0
        ctx.save();
        ctx.translate(this.offset.x, this.offset.y);
        if (this.rotated){
            // cocos2d textures can be rotated clockwise for better packing
            var sw = this.frame.size.height;
            var sh = this.frame.size.width;
            ctx.rotate(- Math.PI / 2);
            ctx.translate(-sw, 0);
        } else {
            var sw = this.frame.size.width;
            var sh = this.frame.size.height;
        }
        ctx.drawImage(
            this.texture,
            this.frame.origin.x, this.frame.origin.y,
            sw, sh,
            0, 0,
            sw, sh
        );
        ctx.restore();
    };

    return Sprite;
})();


var Display = (function(){
// --- API around the double-buffered canvas --- //
    function Display(parentID, fps){
        // attach ourselves to the parent
        this.width = 1280;
        this.height = 640;
        this._bufferID = 'paperbuffer';
        this._screenID = 'paperscreen';
        var el = document.getElementById(parentID);
        var s = ['<canvas id=', this._screenID, ' width=', this.width,
                 ' height=', this.height, '></canvas>',
                 '<canvas id=', this._bufferID, ' width=', this.width,
                 ' height=', this.height, ' style="display:none"',
                 '></canvas>'];
        el.innerHTML += s.join('');
        this.root = null;
        this.fps = fps;
    };

    Display.prototype.update = function(){
    // --- the main loop --- //
        if (this.root){
            this.clear();
            this.root.draw(this.context());
            this.flip_buffer();
        }

        // run again soon...
        setTimeout((function(x){
            return (function(){ x.update();});
        })(this), 1000.0 / this.fps + 1);
    };

    Display.prototype.buffer = function(){
        return document.getElementById(this._bufferID);
    };

    Display.prototype.screen = function(){
        return document.getElementById(this._screenID);
    };

    Display.prototype.clear = function(){
        this.context().clearRect(0,0,this.width,this.height);
    };

    Display.prototype.context = function(){
        return this.buffer().getContext('2d');
    };

    Display.prototype.flip_buffer = function(){
        var ctx = this.screen().getContext('2d');
        ctx.clearRect(0,0,this.width,this.height);
        ctx.drawImage(this.buffer(), 0, 0);
    };

    return Display;
})();


var Stage = (function(){
// --- holds multiple actors --- mostly useless
    function Stage(){
        this._start = (new Date());
        this.actors = {};
        this.backdrop = null;
    };

    Stage.prototype.time = function(){
        return ((new Date()) - this._start) / 1000;
    };

    Stage.prototype.draw = function(ctx){
        ctx.save();

        // draw the backdrop before we flip, for simplicity
        if (this.backdrop){
            // todo, use same scaling logic as on client and draw after flip
            ctx.drawImage(this.backdrop, 0, 0);
        }

        // the y-axis needs to be flipped and shifted to match cocos bottom left
        // instead of canvas top left origin.
        ctx.scale(1, -1);
        ctx.translate(0, -960);

        // todo: retina coordinate transform
        for (var i in this.actors){
            this.actors[i].update(this.time());
            this.actors[i].draw(ctx);
        }
        ctx.restore();
    }

    return Stage;
})();


var WARNING = (function(){
// dont spam the console
    _unique = {};
    return (function(msg){
        if (msg in _unique) return;
        _unique[msg] = true;
        console.log(msg);
    });
})();


// where should we look for texture pngs?
// sadly i dont have a better solution yet.
TEXTURE_PNG_PATH = '/atlas/'
